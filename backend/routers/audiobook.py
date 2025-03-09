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
from pydub import AudioSegment
import os

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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Check if the audiobook already exists for the same user, document, and voice
    existing_audiobook = db.query(AudioBook).filter(
        AudioBook.document_id == document_id,
        AudioBook.voice_id == request.voice_id,
        AudioBook.user_id == request.user_id
    ).first()

    if existing_audiobook:
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

    # Add the TTS conversion task to the background tasks
    try:
        background_tasks.add_task(
            convert_document_to_audio_page_by_page,
            document.file_path,
            str(audio_file_path),
            voice.voice
        )
    except Exception as e:
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

    return {"message": "Audiobook generation started", "audiobook_id": audiobook.audiobook_id, "file_path": f"http://127.0.0.1:8000/{audio_file_path}"}

def convert_document_to_audio_page_by_page(file_path: str, audio_file_path: str, voice: str):
    """Convert document text to audio page by page using Coqui TTS."""
    tts = TTS(model_name=voice)
    audio_segments = []
    page_audio_paths = []  # Store paths of individual page audio files

    # Open the PDF file and extract text page by page
    with fitz.open(file_path) as pdf:
        for page_num, page in enumerate(pdf):
            text = page.get_text()
            text = sanitize_text(text)

            if not text.strip():
                continue  # Skip empty pages

            # Generate audio for the page
            page_audio_path = f"{audio_file_path}_page_{page_num}.wav"
            tts.tts_to_file(text=text, file_path=page_audio_path)
            audio_segments.append(AudioSegment.from_wav(page_audio_path))
            page_audio_paths.append(page_audio_path)  # Store the path for cleanup

    # Merge all audio segments into one file
    combined_audio = sum(audio_segments)
    combined_audio.export(audio_file_path, format="wav")

    # Clean up individual page audio files
    for page_audio_path in page_audio_paths:
        os.remove(page_audio_path)  # Use the stored path for cleanup

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

@audiobook_router.get("/voices")
async def get_voices(db: Session = Depends(get_db)):
    """Fetch available voices from the database."""
    voices = db.query(Voice).all()
    return {"voices": [{"voice_id": v.voice_id, "name": v.voice} for v in voices]}

@audiobook_router.get("/user/{user_id}")
async def get_user_audiobooks(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Fetch all unique audiobooks for a specific user."""
    audiobooks = db.query(AudioBook).filter(AudioBook.user_id == user_id).all()
    
    if not audiobooks:
        raise HTTPException(status_code=404, detail="No audiobooks found for this user.")
    
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
    
    return {"audiobooks": list(unique_audiobooks.values())}

@audiobook_router.get("/status/{audiobook_id}")
async def get_audiobook_status(
    audiobook_id: int,
    db: Session = Depends(get_db)
):
    """Check the status of an audiobook generation."""
    audiobook = db.query(AudioBook).filter(AudioBook.audiobook_id == audiobook_id).first()
    if not audiobook:
        raise HTTPException(status_code=404, detail="Audiobook not found")
    
    # Check if the audiobook file exists
    if Path(audiobook.file_path).exists():
        return {
            "status": "completed",
            "file_path": f"http://127.0.0.1:8000/{audiobook.file_path}"  # Return full URL
        }
    else:
        return {"status": "in_progress"}