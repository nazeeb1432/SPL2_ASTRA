from fastapi import FastAPI, HTTPException,APIRouter,Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from .. import schemas,database,models

get_db=database.get_db

router=APIRouter(
    prefix="/api",
    tags=['bookmarks']
)

# Routes for bookmarks
@router.post("/bookmarks/", response_model=schemas.BookmarkResponse)
def create_bookmark(bookmark: schemas.BookmarkCreate, db: Session = Depends(get_db)):
    # Use bookmark.model_dump() to convert the Pydantic model to a dictionary
    db_bookmark = models.Bookmark(**bookmark.model_dump())
    db.add(db_bookmark)
    db.commit()
    db.refresh(db_bookmark)
    return db_bookmark

@router.get("/bookmarks/{document_id}", response_model=List[schemas.BookmarkResponse])
def get_bookmarks(document_id: int, db: Session = Depends(get_db)):
    return db.query(models.Bookmark).filter(models.Bookmark.document_id == document_id).all()

@router.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    db_bookmark = db.query(models.Bookmark).filter(models.Bookmark.bookmark_id == bookmark_id).first()
    if not db_bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(db_bookmark)
    db.commit()
    return {"message": "Bookmark deleted"}