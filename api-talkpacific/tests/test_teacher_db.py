from typing import List
import mongomock
import unittest
from api_talkpacific.teacher_db import TeacherDB, ConversationMessage, ConversationRole
from api_talkpacific.models import Language


class TestConversationsDB(unittest.TestCase):

    def setUp(self) -> None:
        self.db = TeacherDB(mongo_client=mongomock.MongoClient())
        return super().setUp()

    def test_add_one_message(self):
        db = self.db
        conversation_id = db.create_conversation(
            Language.English,
            Language.Chinese,
        )
        message_id = db.add_message(
            conversation_id=conversation_id,
            role=ConversationRole.User,
            content="Hello!",
        )
        message: ConversationMessage = db.get_message(message_id)

        self.assertIsNotNone(message)
        self.assertEqual(message.conversation_id, conversation_id)
        self.assertEqual(message.content, "Hello!")
        self.assertEqual(message.position, 0)
        self.assertEqual(message.role, ConversationRole.User)

    def test_add_messages(self):
        db = self.db
        conversation_id = db.create_conversation(
            Language.English,
            Language.Chinese,
        )
        db.add_message(
            conversation_id=conversation_id,
            role=ConversationRole.User,
            content="Hello!",
        )
        db.add_message(
            conversation_id=conversation_id,
            role=ConversationRole.Assistant,
            content="你好！",
        )
        messages: List[ConversationMessage] = db.get_messages(conversation_id)

        self.assertIsNotNone(messages)
        self.assertEqual(messages[0].conversation_id, conversation_id)
        self.assertEqual(messages[0].content, "Hello!")
        self.assertEqual(messages[0].position, 0)
        self.assertEqual(messages[0].role, ConversationRole.User)
        self.assertEqual(messages[1].conversation_id, conversation_id)
        self.assertEqual(messages[1].content, "你好！")
        self.assertEqual(messages[1].position, 1)
        self.assertEqual(messages[1].role, ConversationRole.Assistant)

    def test_edit_one_message(self):
        db = self.db
        conversation_id = self._initialize_conversation(db)

        is_success = db.edit_user_message(
            conversation_id=conversation_id,
            position=0,
            content="Hi!",
        )
        messages: List[ConversationMessage] = db.get_messages(conversation_id)

        self.assertTrue(is_success)
        self.assertEqual(1, len(messages))
        self.assertEqual(messages[0].conversation_id, conversation_id)
        self.assertEqual(messages[0].content, "Hi!")
        self.assertEqual(messages[0].position, 0)
        self.assertEqual(messages[0].role, ConversationRole.User)

    def _initialize_conversation(self, db: TeacherDB) -> str:
        conversation_id = db.create_conversation(
            Language.English,
            Language.Chinese,
        )
        db.add_message(
            conversation_id=conversation_id,
            role=ConversationRole.User,
            content="Hello!",
        )
        db.add_message(
            conversation_id=conversation_id,
            role=ConversationRole.Assistant,
            content="你好！",
        )
        return conversation_id


if __name__ == "__main__":
    unittest.main()
