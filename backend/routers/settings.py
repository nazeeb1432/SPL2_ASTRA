from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..models import Settings
from ..database import get_db
from ..schemas import SettingsUpdate

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

@router.get("/{user_id}")
async def get_settings(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Fetch the user's settings."""
    settings = db.query(Settings).filter(Settings.user_id == user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found.")

    return settings

@router.put("/{user_id}")
async def update_settings(
    user_id: str,
    update_data: SettingsUpdate,
    db: Session = Depends(get_db)
):
    """Update the user's settings."""
    settings = db.query(Settings).filter(Settings.user_id == user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found.")

    # Update settings fields
    for key, value in update_data.dict().items():
        if value is not None:
            setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return {"message": "Settings updated successfully.", "settings": settings}

@router.post("/update-streak/{user_id}")
async def update_streak(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Update the user's streak count on login."""
    settings = db.query(Settings).filter(Settings.user_id == user_id).first()
    if not settings:
        settings = Settings(
            user_id=user_id,
            speed=1.0,  # Default speed
            streak_count=0,  # Default streak count
            last_login_date=None,  # No last login date initially
            page_goal=None,  # No page goal initially
            duration_goal=None,  # No duration goal initially
            voice_id=None  # No voice preference initially
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Get the current date
    today = datetime.utcnow().date()

    # Check if the user logged in yesterday
    if settings.last_login_date:
        last_login = settings.last_login_date
        if today == last_login:
            # User already logged in today, do nothing
            return {"message": "Streak already updated today."}
        elif today == last_login + timedelta(days=1):
            # User logged in consecutively, increment streak
            settings.streak_count += 1
        else:
            # User broke the streak, reset to 1
            settings.streak_count = 1
    else:
        # First login, set streak to 1
        settings.streak_count = 1

    # Update the last login date
    settings.last_login_date = today

    db.commit()
    db.refresh(settings)

    # Check for milestones and return a message
    milestone_message = ""
    if settings.streak_count % 7 == 0:
        milestone_message = f"Congratulations! You've reached a {settings.streak_count}-day streak!"
    elif settings.streak_count % 30 == 0:
        milestone_message = f"Amazing! You've reached a {settings.streak_count}-day streak!"

    return {
        "message": "Streak updated successfully.",
        "streak_count": settings.streak_count,
        "milestone_message": milestone_message,
    }