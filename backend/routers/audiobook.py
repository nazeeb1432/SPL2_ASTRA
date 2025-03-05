from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pathlib import Path
from TTS.api import TTS
from ..models import AudioBook, Voice, Document
from ..database import get_db
from ..schemas import GenerateAudiobookRequest
import fitz
import torch
import re

# Directory to store audiobooks
AUDIOBOOK_DIR = Path("audiobooks")
AUDIOBOOK_DIR.mkdir(exist_ok=True)

audiobook_router = APIRouter(
    prefix="/audiobooks",
    tags=["Audiobooks"]
)

@audiobook_router.post("/generate/{document_id}")
async def generate_audiobook(
    document_id: int,
    request: GenerateAudiobookRequest,
    background_tasks: BackgroundTasks,  # Moved before default arguments
    db: Session = Depends(get_db)
):
    # Check if the audiobook already exists for the same user, document, and voice
    existing_audiobook = db.query(AudioBook).filter(
        AudioBook.document_id == document_id,
        AudioBook.voice_id == request.voice_id,
        AudioBook.user_id == request.user_id  # Use user_id from the request
    ).first()

    if existing_audiobook:
        # Return the existing audiobook's file path
        return {
            "message": "Audiobook already exists.",
            "audiobook_id": existing_audiobook.audiobook_id,
            "file_path": f"http://127.0.0.1:8000/{existing_audiobook.file_path}"
        }




    # Fetch the document from the database
    document = db.query(Document).filter(Document.document_id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Fetch the voice from the database
    voice = db.query(Voice).filter(Voice.voice_id == request.voice_id).first()
    if not voice:
        raise HTTPException(status_code=404, detail="Voice not found")
    
    # Define the path for the audiobook
    audio_file_path = AUDIOBOOK_DIR / f"{document_id}_{request.voice_id}.wav"

    # Log the audio file path
    print(f"Audio File Path: {audio_file_path}")

    # Add the TTS conversion task to the background tasks
    try:
        # Add background task to generate audio
        background_tasks.add_task(
            convert_document_to_audio,
            document.file_path,
            str(audio_file_path),
            voice.voice
        )
    except Exception as e:
        # Log and return a meaningful HTTP response
        print(f"Error in generating audiobook: {e}")
        raise HTTPException(status_code=500, detail=f"Error in generating audiobook: {e}")

    # Add the audiobook to the database
    audiobook = AudioBook(
        document_id=document_id,
        user_id=document.user_id,
        voice_id=request.voice_id,
        file_path=str(audio_file_path),
        progress=0.0,
        duration=0.0  # Placeholder; duration can be updated later
    )
    db.add(audiobook)
    db.commit()
    db.refresh(audiobook)

    return {"message": "Audiobook generation started", "audiobook_id": audiobook.audiobook_id,"file_path": f"http://127.0.0.1:8000/{audio_file_path}"}


# def convert_document_to_audio(file_path: str, audio_file_path: str, voice: str):
#     """Convert document text to audio using Coqui TTS."""
#     tts = TTS(model_name=voice)
#     with open(file_path, "r") as file:
#         text = file.read()
#     tts.tts_to_file(text=text, file_path=audio_file_path)

# def sanitize_text(text: str) -> str:
#     """Clean and normalize the extracted text."""
#     # Remove unsupported characters
#     text = re.sub(r"[^a-zA-Z0-9.,!? ]", "", text)
#     # Normalize whitespace
#     text = " ".join(text.split())
#     return text

def sanitize_text(input_text):
    # Remove non-English characters
    sanitized = re.sub(r'[^\x00-\x7F]+', ' ', input_text)
    
    # Remove unnecessary symbols (like images/logos) and excessive spaces
    sanitized = re.sub(r'[^\w\s.,!?]', '', sanitized)  # Keep common punctuation
    sanitized = re.sub(r'\s+', ' ', sanitized).strip()  # Remove extra spaces
    
    # Fix words without spaces (basic heuristic for camelCase or ALLCAPS)
    sanitized = re.sub(r'([a-z])([A-Z])', r'\1 \2', sanitized)  # camelCase to camel Case
    sanitized = re.sub(r'([A-Z]{2,})([a-z])', r'\1 \2', sanitized)  # ALLCAPSto ALL CAPS
    
    # Ensure proper punctuation (add periods at the end of sentences if missing)
    sanitized = re.sub(r'(?<![.!?])\n', '.\n', sanitized)  # Add periods before new lines if none exist
    sanitized = re.sub(r'(?<![.!?])$', '.', sanitized)  # Add period at the end of the text if missing
    
    return sanitized

def convert_document_to_audio(file_path: str, audio_file_path: str, voice: str):
    """Convert document text to audio using Coqui TTS."""
    tts = TTS(model_name=voice)
    text = ""

    # Open the PDF file and extract text
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()

    text = sanitize_text(text)

    # Check if text extraction was successful
    if not text.strip():
        raise ValueError("No text could be extracted from the PDF.")
    
    if len(text) < 50:  # Adjust this threshold as needed
        raise ValueError("The extracted text is too short to process. Add more content.")
    
    
    
    tts.tts_to_file(text=text, file_path=audio_file_path)
    
     
    
    # print(text)


@audiobook_router.get("/voices")
async def get_voices(db: Session = Depends(get_db)):
    """Fetch available voices from the database."""
    voices = db.query(Voice).all()
    return {"voices": [{"voice_id": v.voice_id, "name": v.voice} for v in voices]}


# @audiobook_router.get("/user/{user_id}")
# async def get_user_audiobooks(
#     user_id: str,
#     db: Session = Depends(get_db)
# ):
#     """Fetch all audiobooks for a specific user."""
#     audiobooks = db.query(AudioBook).filter(AudioBook.user_id == user_id).all()
    
#     if not audiobooks:
#         raise HTTPException(status_code=404, detail="No audiobooks found for this user.")
    
#     return {
#         "audiobooks": [
#             {
#                 "audiobook_id": ab.audiobook_id,
#                 "document_title": ab.document.title,
#                 "voice_id": ab.voice_id,
#                 "file_path": ab.file_path,
#             }
#             for ab in audiobooks
#         ]
#     }


@audiobook_router.get("/user/{user_id}")
async def get_user_audiobooks(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Fetch all unique audiobooks for a specific user."""
    # Fetch all audiobooks for the user
    audiobooks = db.query(AudioBook).filter(AudioBook.user_id == user_id).all()
    
    if not audiobooks:
        raise HTTPException(status_code=404, detail="No audiobooks found for this user.")
    
    # Use a dictionary to store unique audiobooks based on document_id and voice_id
    unique_audiobooks = {}
    for ab in audiobooks:
        key = (ab.document_id, ab.voice_id)
        if key not in unique_audiobooks:
            unique_audiobooks[key] = {
                "audiobook_id": ab.audiobook_id,
                "document_title": ab.document.title,
                "voice_id": ab.voice_id,
                "file_path": ab.file_path,
            }
    
    # Convert the dictionary values to a list
    return {"audiobooks": list(unique_audiobooks.values())}
