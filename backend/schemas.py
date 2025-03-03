from pydantic import BaseModel
from typing import List

class User(BaseModel):
    name:str
    email:str
    password:str

class ShowUser(BaseModel):
    name:str
    email:str
    class config:
        orm_mode=True

class Login(BaseModel):
    username:str
    password:str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None

class GenerateAudiobookRequest(BaseModel):
    voice_id: int
    user_id:str

class TextRequest(BaseModel):
    text: str

class NoteCreate(BaseModel):
    document_id: int
    note_title: str
    content: str
    page: int

class NoteResponse(BaseModel):
    note_id: int
    document_id: int
    note_title: str
    content: str
    page: int

class BookmarkCreate(BaseModel):
    document_id: int
    page_number: int
    description: str

class BookmarkResponse(BaseModel):
    bookmark_id: int
    document_id: int
    page_number: int
    description: str
