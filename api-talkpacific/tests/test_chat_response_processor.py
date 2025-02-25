import unittest
from api_talkpacific.language_coach import ChatResponseChunkProcessor


class TestChatResponseChunkProcessor(unittest.TestCase):
    def test_single_sentence(self):
        processor = ChatResponseChunkProcessor("test_id")
        processor.state.content = "Hello world."
        processor.state.content_finished = True
        sentences = processor.create_sentences()
        sentence_indices = processor.state.sentence_indices
        self.assertEqual(len(sentences), 1)
        self.assertEqual(sentences[0], "Hello world.")
        self.assertEqual(sentence_indices[0][0], 0)
        self.assertEqual(sentence_indices[0][1], len("Hello world."))

    def test_multiple_sentences(self):
        processor = ChatResponseChunkProcessor("test_id")
        processor.state.content = "First sentence. Second sentence."
        processor.state.content_finished = True
        sentences = processor.create_sentences()
        self.assertEqual(len(sentences), 2)
        self.assertEqual(sentences[0], "First sentence.")
        self.assertEqual(sentences[1], "Second sentence.")

    def test_sentences_with_punctuation(self):
        processor = ChatResponseChunkProcessor("test_id")
        content = "What's up? Everything's fine! Great."
        processor.state.content = content
        processor.state.content_finished = True
        sentences = processor.create_sentences()
        self.assertEqual(len(sentences), 3)
        self.assertEqual(sentences[0], "What's up?")
        self.assertEqual(sentences[1], "Everything's fine!")
        self.assertEqual(sentences[2], "Great.")

    def test_sentences_with_bullet_points_and_new_lines(self):
        processor = ChatResponseChunkProcessor("test_id")
        content = "* Item 1\n* Item 2\nLast line."
        processor.state.content = content
        processor.state.content_finished = True
        sentences = processor.create_sentences()
        self.assertEqual(len(sentences), 3)
        self.assertEqual(sentences[0], "* Item 1\n")
        self.assertEqual(sentences[1], "* Item 2\n")
        self.assertEqual(sentences[2], "Last line.")

    def test_empty_string(self):
        processor = ChatResponseChunkProcessor("test_id")
        processor.state.content_finished = True
        sentences = processor.create_sentences()
        self.assertEqual(len(sentences), 0)


if __name__ == "__main__":
    unittest.main()
