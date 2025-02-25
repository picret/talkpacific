import re
from typing import Generator, List, Tuple
import os
import logging
from operator import itemgetter
import uuid
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.messages import BaseMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from .models import (
    ChatResponseChunk,
    Language,
)
from .language_detector import LanguageDetector
from .teacher_db import (
    ConversationMessage,
    ConversationRole,
    TeacherDB,
    ConversationMemory,
)

COACH_SYSTEM_PROMPT = """You are a helpful language teacher.
You are helping a student learn {learning_language}.
The user's primary language is {primary_language}.
Please respond with the intention to teach.
The student is learning {learning_language} and is familiar with {primary_language}.
Be concise and clear with a goal to teach {learning_language} wherever you can.
Take any opportunity you can to teach {learning_language}.
If the user is interested in learning history or culture, \
you can teach them about {learning_language} history or culture."""


class LanguageCoach:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.llm = ChatOpenAI(
            openai_api_key=api_key,
            model_name="gpt-3.5-turbo-1106",
            streaming=True,
            callbacks=[StreamingStdOutCallbackHandler()],
        )
        self.teacher_db = TeacherDB()

    def create_conversation(
        self,
        primary: Language,
        learning: Language,
    ) -> str:
        return self.teacher_db.create_conversation(
            primary=primary,
            learning=learning,
        )

    def send_message(
        self,
        conversation_id: str,
        message: str,
    ) -> Generator[ChatResponseChunk, None, None]:
        parameters = {
            "history": itemgetter("history"),
            "primary_language": itemgetter("primary_language"),
            "learning_language": itemgetter("learning_language"),
            "input": itemgetter("input"),
        }
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", COACH_SYSTEM_PROMPT),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}"),
            ]
        )
        chain = parameters | prompt | self.llm | StrOutputParser()
        conversation: ConversationMemory = self.teacher_db.get_conversation(
            conversation_id
        )
        history: List[BaseMessage] = self.load_history(conversation)
        logging.info(f"current history: {history=}")
        stream = chain.stream(
            {
                "history": history,
                "primary_language": conversation.primary.value,
                "learning_language": conversation.learning.value,
                "input": message,
            }
        )

        self.teacher_db.add_message(
            conversation_id=conversation_id,
            role=ConversationRole.User,
            content=message,
        )

        # Create uuid
        chunk_generator = ChatResponseChunkProcessor(conversation_id=conversation_id)
        for chunk in stream:
            response_chunk = chunk_generator.process_chunk(chunk=chunk)
            if response_chunk is not None:
                yield response_chunk

        # Parse the final response and decorate it with annotations
        chunk_generator.state = chunk_generator.state.model_copy(
            update={"content_finished": True}
        )
        response_model = chunk_generator.state
        chunk_generator.create_sentences()
        learning_phrases = LanguageDetector().detect(
            message=response_model.content,
            primary=conversation.primary,
            learning=conversation.learning,
        )

        final_chunk = ChatResponseChunk(
            conversation_id=conversation_id,
            content_id=response_model.content_id,
            delta="",
            is_finished=True,
            sentence_indices=chunk_generator.state.sentence_indices,
            learning_phrases=learning_phrases,
        )
        self.teacher_db.add_message(
            conversation_id=final_chunk.conversation_id,
            role=ConversationRole.Assistant,
            content=response_model.content,
            sentence_indices=final_chunk.sentence_indices,
            learning_phrases=final_chunk.learning_phrases,
        )

        yield final_chunk
        logging.info(f"completed stream: {final_chunk=}")

    def load_history(self, memory: ConversationMemory) -> List[BaseMessage]:
        """
        Load memory variables for LLM processing.
        """
        message_history = ChatMessageHistory()
        for msg in memory.messages:
            if msg.role == ConversationRole.User:
                message_history.add_user_message(msg.content)
            else:
                message_history.add_ai_message(msg.content)
        return message_history.messages

    def get_conversation_memories(self) -> List[ConversationMemory]:
        return self.teacher_db.get_conversation_memories()

    def delete_conversation(self, conversation_id: str) -> bool:
        return self.teacher_db.delete_conversation(conversation_id)

    def get_messages(self, conversation_id: str) -> List[ConversationMessage]:
        return self.teacher_db.get_messages(conversation_id)

    def delete_messages(self, conversation_id: str, position: int) -> bool:
        return self.teacher_db.delete_messages(conversation_id, position)


class ChatResponseState(BaseModel):
    conversation_id: str
    content: str = ""
    content_id: str = ""
    content_finished: bool = False
    sentence_indices: List[Tuple[int, int]] = []


class ChatResponseChunkProcessor:

    def __init__(self, conversation_id: str):
        self.state = ChatResponseState(
            conversation_id=conversation_id, content_id=str(uuid.uuid4())
        )

    def process_chunk(self, chunk: str) -> ChatResponseChunk | None:
        if chunk is not None and len(chunk) > 0:
            delta_content = chunk if chunk is not None else ""
            self.state = self.state.model_copy(
                update={
                    "content": self.state.content + delta_content,
                }
            )
            return ChatResponseChunk(
                conversation_id=self.state.conversation_id,
                content_id=self.state.content_id,
                delta=delta_content,
                is_finished=self.state.content_finished,
            )
        return None

    def create_sentences(self) -> List[str]:
        if not self.state.content_finished:
            return []
        if len(self.state.sentence_indices) > 0:
            return [
                self.state.content[start:end]
                for start, end in self.state.sentence_indices
            ]

        sentence_indices = []
        content = self.state.content
        regex_sentence = r"(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s|(?<=\n)"

        start_index = 0
        for match in re.finditer(regex_sentence, content):
            end_index = match.start()
            sentence = content[start_index:end_index].strip()
            if sentence:
                sentence_indices.append((start_index, end_index))
            start_index = match.end()

        # Handle the last sentence
        if start_index < len(content):
            sentence_indices.append((start_index, len(content)))
        self.state = self.state.model_copy(
            update={"sentence_indices": sentence_indices}
        )

        return [
            self.state.content[start:end] for start, end in self.state.sentence_indices
        ]
