import json
from operator import itemgetter
from typing import List
import os
import logging
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

from .models import Language

COACH_SYSTEM_PROMPT = """You are an assistant trained to extract {learning_language} \
phrases sentences and paragraphs from a content mixed with {primary_language}.
Respond with a JSON array containing only the extracted {learning_language} \
phrases or sentences.
Do not include any {primary_language} text.
Preserve the original case and format of the message \
to allow for accurate text highlighting.

Examples:
User says, "你好! (Nǐ hǎo!) This means "hello" in Chinese. \
If you want to be more polite, you can say "您好" (Nín hǎo)."
Your response: ["你好!", "您好"]
User says, "你好, Kyle。我叫[Your Name]。\
很高兴认识你！(Nǐ hǎo, Kyle. Wǒ jiào [Your Name]. \
Hěn gāoxìng rènshì nǐ!) "Hello, Kyle."
Your response: ["你好!", "我叫", "很高兴认识你！"]"""

# TODO - This is a good example of a class that could use a simpler model.


class LanguageDetector:
    """
    Finds all the phrases or words in a message that are in the learning language.
    """

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.llm = ChatOpenAI(
            openai_api_key=api_key,
            model_name="gpt-3.5-turbo",
            temperature=0.0,
        )

    def detect(self, message: str, primary: Language, learning: Language) -> List[str]:
        logging.info(f"Detecting {learning.value} phrases in {message=}")
        parameters = {
            "primary_language": itemgetter("primary_language"),
            "learning_language": itemgetter("learning_language"),
            "input": itemgetter("input"),
        }
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", COACH_SYSTEM_PROMPT),
                ("human", "{input}"),
            ]
        )
        chain = parameters | prompt | self.llm
        response = chain.invoke(
            {
                "primary_language": primary.value,
                "learning_language": learning.value,
                "input": message,
            }
        )
        try:
            learning_phrases = json.loads(response.content)
            logging.info(f"Found learning phrases: {learning_phrases}")
            if not isinstance(learning_phrases, list):
                logging.error("Unable to parse response into array of strings.")
                return []

            return learning_phrases

        except (AttributeError, TypeError, json.JSONDecodeError) as e:
            logging.error(f"Failed to parse {response=}")
            logging.error(f"Error processing response: {e}")
            return []
