from enum import Enum
from typing import List, Tuple
from pydantic import BaseModel


class Dialect(str, Enum):
    Mandarin = "mandarin"
    Cantonese = "cantonese"
    Min = "min"
    Jin = "jin"
    Wu = "wu"
    Xiang = "xiang"
    Hakka = "hakka"
    Pinghua = "pinghua"


class Script(str, Enum):
    Simplified = "hans"
    Traditional = "hant"


class Region(str, Enum):
    China = "cn"
    Singapore = "sg"
    HongKong = "hk"
    Macao = "mo"
    Taiwan = "tw"


class Language(str, Enum):
    English = "english"
    Chinese = "chinese"
    Mandarin = "mandarin"
    Cantonese = "cantonese"
    Spanish = "spanish"
    French = "french"
    Ukrainian = "ukrainian"
    Korean = "korean"
    Japanese = "japanese"
    Hindi = "hindi"
    Bengali = "bengali"
    Portuguese = "portuguese"
    German = "german"
    Russian = "russian"
    Polish = "polish"
    Turkish = "turkish"
    Italian = "italian"


class ChatResponseChunk(BaseModel):
    conversation_id: str
    content_id: str
    delta: str
    is_finished: bool
    sentence_indices: List[Tuple[int, int]] = None
    learning_phrases: List[str] = None
