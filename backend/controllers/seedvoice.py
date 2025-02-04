from sqlalchemy.orm import Session
from backend.models import Voice
from backend.database import SessionLocal

def seed_voices():
    default_voices = [
        {"voice_id": 1, "voice": "tts_models/en/ljspeech/tacotron2-DDC"},
        {"voice_id": 2, "voice": "tts_models/en/ljspeech/glow-tts"},
        {"voice_id": 3, "voice": "tts_models/en/ljspeech/vits"},
        {"voice_id": 4, "voice": "tts_models/de/thorsten/tacotron2-DDC"},  # German voice
        {"voice_id": 5, "voice": "tts_models/fr/css10/vits"},  # French voice
    ]
    
    db: Session = SessionLocal()
    try:
        for voice in default_voices:
            existing_voice = db.query(Voice).filter(Voice.voice_id == voice["voice_id"]).first()
            if not existing_voice:
                new_voice = Voice(**voice)
                db.add(new_voice)
        db.commit()
    finally:
        db.close()


