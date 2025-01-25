from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..models import Folder
from ..database import get_db

folder_router = APIRouter()

class FolderCreateRequest(BaseModel):
    user_id: str
    folder_name: str

class FolderRenameRequest(BaseModel):
    folder_name: str

@folder_router.post("/folders/create")
async def create_folder(request: FolderCreateRequest, db: Session = Depends(get_db)):
    new_folder = Folder(user_id=request.user_id, folder_name=request.folder_name)
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return {"message": "Folder created successfully", "folder": new_folder}


@folder_router.get("/folders/{user_id}")
async def get_folders(user_id: str, db: Session = Depends(get_db)):
    folders = db.query(Folder).filter(Folder.user_id == user_id).all()
    return {"folders": folders}

@folder_router.put("/folders/rename/{folder_id}")
async def rename_folder(folder_id: int, request: FolderRenameRequest, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.folder_id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    folder.folder_name = request.folder_name
    db.commit()
    return {"message": "Folder renamed successfully"}


@folder_router.delete("/folders/delete/{folder_id}")
async def delete_folder(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.folder_id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    return {"message": "Folder deleted successfully"}
