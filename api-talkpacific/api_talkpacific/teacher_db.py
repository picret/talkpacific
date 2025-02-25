import logging
from enum import Enum
from typing import List, Tuple
from bson import ObjectId
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.results import InsertOneResult, DeleteResult
from pymongo.collection import Collection
from pymongo.errors import PyMongoError
import os

from .models import Language


class ConversationRole(str, Enum):
    User = "user"
    Assistant = "assistant"


class ConversationMessage(BaseModel):
    conversation_id: str
    position: int
    role: ConversationRole
    content: str
    sentence_indices: List[Tuple[int, int]] = None
    learning_phrases: List[str] = None


class ConversationMemory(BaseModel):
    conversation_id: str
    primary: Language
    learning: Language
    messages: List[ConversationMessage] = []


class TeacherDB:

    client: MongoClient
    db: Database
    conversations: Collection
    messages: Collection

    def __init__(
        self: "TeacherDB",
        mongo_client: MongoClient = None,
    ) -> None:
        if mongo_client:
            self.client = mongo_client
        else:
            MONGODB_URI = os.environ["MONGODB_URI"]
            self.client = MongoClient(MONGODB_URI)
            try:
                self.client.admin.command("ping")
                logging.info("Pinged mongodb")
            except Exception as e:
                logging.error(e)

        self.db = self.client.teacher
        self.conversations = self.db.conversations
        self.messages = self.db.messages
        logging.info(f"connected to {self.client=}")

    def create_conversation(
        self: "TeacherDB",
        primary: Language,
        learning: Language,
    ) -> str:
        conversation_document = {
            "primary_language": primary.value,
            "learning_language": learning.value,
        }
        logging.info(f"create conversation document {conversation_document}")
        result: InsertOneResult = self.conversations.insert_one(conversation_document)
        logging.info(f"create conversation result {result=}")
        return str(result.inserted_id)

    def get_conversation(self, conversation_id: str) -> ConversationMemory:
        conversation_document = self.conversations.find_one(
            {"_id": ObjectId(conversation_id)}
        )
        messages = self.get_messages(conversation_id)
        logging.info(f"get conversation document {conversation_document}")
        return ConversationMemory(
            conversation_id=str(conversation_document["_id"]),
            primary=Language(conversation_document["primary_language"]),
            learning=Language(conversation_document["learning_language"]),
            messages=messages,
        )

    def get_conversation_memories(self, limit: int = 10) -> List[ConversationMemory]:
        """
        Retrieves a limited number of conversations from the 'conversations' collection.

        :param limit: The maximum number of conversation documents to retrieve.
        :return: A list memories from past conversations.
        """
        conversations = []
        try:
            conversations_cursor = self.conversations.find({}).limit(limit)
            for doc in conversations_cursor:
                conversation = ConversationMemory(
                    conversation_id=str(doc["_id"]),
                    primary=Language(doc["primary_language"]),
                    learning=Language(doc["learning_language"]),
                )
                conversations.append(conversation)
            logging.info(f"Retrieved {limit} conversations as Conversation objects")
        except PyMongoError as e:
            logging.error(f"Error retrieving conversations: {e}")
        return conversations

    def delete_conversation(self, conversation_id: str) -> bool:
        delete_messages_result = self.delete_messages(conversation_id, 0)
        logging.info(
            f"delete_conversation delete_messages_result: {delete_messages_result}"
        )
        if not delete_messages_result:
            logging.error(
                f"failed to delete messages for conversation: {conversation_id}"
            )
            return False
        object_id = ObjectId(conversation_id)
        delete_result: DeleteResult = self.conversations.delete_one({"_id": object_id})
        if delete_result.deleted_count != 1:
            logging.error(
                f"failed to delete conversation: {conversation_id=}, {delete_result=}"
            )
            return False
        return True

    def add_message(
        self: "TeacherDB",
        conversation_id: str,
        role: ConversationRole,
        content: str,
        sentence_indices: List[Tuple[int, int]] = [],
        learning_phrases: List[str] = [],
    ) -> str:
        last_message = self.messages.find_one(
            {"conversation_id": conversation_id}, sort=[("position", -1)]
        )
        position = last_message["position"] + 1 if last_message else 0

        message = {
            "conversation_id": conversation_id,
            "position": position,
            "role": role.value,
            "content": content,
            "sentence_indices": sentence_indices,
            "learning_phrases": learning_phrases,
        }
        result: InsertOneResult = self.messages.insert_one(message)
        return str(result.inserted_id)

    def edit_user_message(
        self: "TeacherDB",
        conversation_id: str,
        position: int,
        content: str,
    ) -> bool:
        message_document = self.messages.find_one_and_update(
            {
                "conversation_id": conversation_id,
                "position": position,
                "role": ConversationRole.User.value,
            },
            {"$set": {"content": content}},
        )
        if not message_document:
            logging.error(
                f"failed to edit message: {conversation_id=}, {position=}, {content=}"
            )
            return False

        position = message_document["position"]
        delete_result: DeleteResult = self.messages.delete_many(
            {"conversation_id": conversation_id, "position": {"$gt": position}}
        )
        if delete_result.deleted_count != 1:
            logging.error(
                f"edit_user_message failed to delete messages: \
                {conversation_id=}, \
                {position=}, \
                {delete_result=}"
            )
            return False
        return True

    def get_message(self, message_id: str) -> ConversationMessage:
        message_document = self.messages.find_one({"_id": ObjectId(message_id)})
        return TeacherDB._map_to_conversation_message(message_document)

    def get_messages(self, conversation_id: str) -> List[ConversationMessage]:
        cursor = self.messages.find({"conversation_id": conversation_id}).sort(
            "position", 1
        )
        messages = []
        for msg in cursor:
            message = TeacherDB._map_to_conversation_message(msg)
            messages.append(message)
        return messages

    def delete_messages(self, conversation_id: str, position: int) -> bool:
        delete_result: DeleteResult = self.messages.delete_many(
            {"conversation_id": conversation_id, "position": {"$gte": position}}
        )
        logging.info(f"delete_messages result: {delete_result}")
        if not delete_result.acknowledged:
            logging.error(
                f"delete_messages failed: \
                {conversation_id=}, \
                {position=}, \
                {delete_result=}"
            )
            return False
        return True

    @staticmethod
    def _map_to_conversation_message(message_document: dict) -> ConversationMessage:
        return ConversationMessage(
            conversation_id=message_document["conversation_id"],
            position=message_document["position"],
            role=ConversationRole(message_document["role"]),
            content=message_document["content"],
            sentence_indices=message_document["sentence_indices"],
            learning_phrases=message_document["learning_phrases"],
        )

    @staticmethod
    def _map_to_conversation_document(message: ConversationMessage) -> dict:
        return {
            "conversation_id": message.conversation_id,
            "position": message.position,
            "role": message.role.value,
            "content": message.content,
            "sentence_indices": message.sentence_indices,
            "learning_phrases": message.learning_phrases,
        }
