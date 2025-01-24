from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import fitz  
from ..models import Document
from ..database import get_db

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

document_router = APIRouter()

@document_router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), user_id: str = Form(...), db: Session = Depends(get_db)):
    try:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_url= f"http://127.0.0.1:8000/uploads/{file.filename}"
        
        # Handle PDFs only (avoid errors with other formats)
        if file.filename.lower().endswith(".pdf"):
            pdf_document = fitz.open(str(file_path))
            length = pdf_document.page_count
            is_scanned = True

            for page_num in range(length):
                page = pdf_document.load_page(page_num)
                text = page.get_text()
                if text.strip():
                    is_scanned = False
                    break
        else:
            length = 1  
            is_scanned = False  # Assume text-based files are not scanned

        new_document = Document(
            title=file.filename,
            user_id=user_id,
            file_path=str(file_url),
            is_scanned=is_scanned,
            progress=0,
            length=length
        )
        
        db.add(new_document)
        db.commit()
        db.refresh(new_document)

        return {"message": "Document uploaded successfully", "document_id": new_document.document_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {e}")

@document_router.get("/documents/view/{document_id}")
async def view_document(document_id: int, db: Session = Depends(get_db)):

    document = db.query(Document).filter(Document.document_id == document_id).first()

    if not document:
        print(f"Document with ID {document_id} not found in database!")
        raise HTTPException(status_code=404, detail="Document not found")

    print(f"Serving document: {document.file_path}")


    return {
        "document_id": document.document_id,
        "title": document.title,
        "file_path": document.file_path,
    }

@document_router.get("/documents/{user_id}")
async def get_user_documents(user_id: str, db: Session = Depends(get_db)):
    print(f"📤 Fetching documents for user: {user_id}")  # Debugging

    documents = db.query(Document).filter(Document.user_id == user_id).all()

    if not documents:
        print(f"❌ No documents found for user: {user_id}")

    else:
        print(f"✅ Documents found: {len(documents)}")

    return {"documents": documents}

