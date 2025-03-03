from fastapi import FastAPI, HTTPException,APIRouter,Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from .. import schemas,database,models

get_db=database.get_db

router=APIRouter(
    prefix="/api",
    tags=['Notes']
)

@router.post("/notes/", response_model=schemas.NoteResponse)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = models.Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/notes/{document_id}", response_model=List[schemas.NoteResponse])
def get_notes(document_id: int, db: Session = Depends(get_db)):
    return db.query(models.Note).filter(models.Note.document_id == document_id).all()

@router.put("/notes/{note_id}", response_model=schemas.NoteResponse)
def update_note(note_id: int, note: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.note_id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db_note.document_id = note.document_id
    db_note.note_title = note.note_title
    db_note.content = note.content
    db_note.page = note.page
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.note_id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted"}

