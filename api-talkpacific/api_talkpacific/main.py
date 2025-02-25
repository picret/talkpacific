import logging
from typing import List, Tuple
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse  # noqa: F401
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from pydantic import BaseModel

from .teacher_db import ConversationMemory, ConversationMessage
from .language_coach import LanguageCoach
from .models import (
    ChatResponseChunk,
    Language,
)

load_dotenv()

executor = ThreadPoolExecutor(max_workers=1)
languageCoach: LanguageCoach = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def startup_event():
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logging.info("Started translation service")
    global languageCoach
    languageCoach = LanguageCoach()


async def shutdown_event():
    executor.shutdown(wait=True)


app.add_event_handler("startup", startup_event)
app.add_event_handler("shutdown", shutdown_event)


@app.get("/")
async def status():
    return {"status": "ok"}


class ConversationCreateResponse(BaseModel):
    conversation_id: str


@app.get("/create-conversation")
async def create_conversation(
    request: Request,
    primary: Language = Language.English,
    learning: Language = Language.Chinese,
) -> ConversationCreateResponse:
    url = (
        f"{request.url.scheme}://{request.url.netloc}/create-conversation?"
        + f"primary={primary.value}&"
        + f"learning={learning.value}"
    )
    logging.info(f"create_conversation: {url=}")
    conversation_id = languageCoach.create_conversation(
        primary=primary,
        learning=learning,
    )
    logging.info(f"conversation created {conversation_id}")
    return ConversationCreateResponse(
        conversation_id=conversation_id,
    )


class DeleteConversationRequest(BaseModel):
    conversation_id: str


@app.post("/delete-conversation")
async def delete_conversation(
    request: DeleteConversationRequest,
) -> JSONResponse:
    logging.info(f"deleting conversation {request}")
    success = languageCoach.delete_conversation(request.conversation_id)
    if not success:
        return JSONResponse(content={"status": "error"})
    else:
        return JSONResponse(content={"status": "ok"})


@app.get("/send-message")
async def send_message(
    request: Request,
    conversation_id: str,
    message: str,
) -> StreamingResponse:
    url = (
        f"{request.url.scheme}://{request.url.netloc}/send-message?"
        + f"{message=}&"
        + f"{conversation_id=}"
    )
    logging.info(f"Requesting chat stream: {url=}")

    async def generator():
        stream = languageCoach.send_message(
            conversation_id=conversation_id,
            message=message,
        )

        for chunk in stream:
            if isinstance(chunk, ChatResponseChunk):
                response_json = chunk.model_dump_json(exclude_unset=True)
                yield f"data: {response_json}\n\n"
            else:
                logging.error(f"Expected a string, got: {type(chunk)}")

    return StreamingResponse(generator(), media_type="text/event-stream")


class ConversationMemoryItem(BaseModel):
    conversation_id: str
    primary: str
    learning: str
    messages: List[str]


class ConversationsResponse(BaseModel):
    items: List[ConversationMemoryItem]


@app.get("/conversations")
async def conversations() -> ConversationsResponse:
    logging.info("Requesting conversation history")
    memories: List[ConversationMemory] = languageCoach.get_conversation_memories()
    items = [
        ConversationMemoryItem(
            conversation_id=memory.conversation_id,
            primary=memory.primary.value,
            learning=memory.learning.value,
            messages=[],
        )
        for memory in memories
    ]
    response = ConversationsResponse(items=items)
    logging.info(f"conversation history: {response}")
    return response


class MessageMemoryItem(BaseModel):
    conversation_id: str
    position: int
    role: str
    content: str
    sentence_indices: List[Tuple[int, int]]
    learning_phrases: List[str]


class MessagesResponse(BaseModel):
    items: List[MessageMemoryItem]


@app.get("/messages")
async def messsages(
    conversation_id: str,
) -> MessagesResponse:
    logging.info("Requesting message history")
    memories: List[ConversationMessage] = languageCoach.get_messages(conversation_id)
    items = [
        MessageMemoryItem(
            conversation_id=memory.conversation_id,
            position=memory.position,
            role=memory.role,
            content=memory.content,
            sentence_indices=memory.sentence_indices,
            learning_phrases=memory.learning_phrases,
        )
        for memory in memories
    ]
    response = MessagesResponse(items=items)
    logging.info(f"returning messages count: {len(response.items)}")
    logging.info(f"message history: {response}")
    return response


class DeleteMessagesRequest(BaseModel):
    conversation_id: str
    position: int


@app.post("/delete-messages")
async def delete_messages(
    request: DeleteMessagesRequest,
) -> JSONResponse:
    logging.info(f"deleting messages {request}")
    success = languageCoach.delete_messages(request.conversation_id, request.position)
    if not success:
        return JSONResponse(content={"status": "error"})
    else:
        return JSONResponse(content={"status": "ok"})
