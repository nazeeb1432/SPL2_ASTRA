from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
import fitz  # PyMuPDF
import pytesseract  # OCR for images
from PIL import Image  # For image processing
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from werkzeug.utils import secure_filename
import logging
from ..models import Document
from ..database import get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

document_router = APIRouter()

def extract_image_text(image_path: str) -> str:
    """Extract text from image using OCR"""
    try:
        image = Image.open(image_path)
        return pytesseract.image_to_string(image)
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to extract text from image")

def create_pdf_from_text(text: str, output_path: str):
    """Generate a multi-page PDF from extracted text"""
    try:
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Split text into paragraphs and add to the PDF
        for paragraph in text.split('\n'):
            p = Paragraph(paragraph, styles["BodyText"])
            story.append(p)

        doc.build(story)
    except Exception as e:
        logger.error(f"Error generating PDF: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

@document_router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    folder_id: int = Form(None),
    db: Session = Depends(get_db),
):
    try:
        # Sanitize filename
        filename = secure_filename(file.filename)
        file_ext = Path(filename).suffix.lower()[1:]  # Extract and normalize file extension

        # Validate file extension
        if file_ext not in {"pdf", "png", "jpg", "jpeg"}:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Only PDF and images (PNG, JPG, JPEG) are allowed."
            )

        file_path = UPLOAD_DIR / filename
        pdf_path = None  # Track generated PDF path

        # Stream file to disk
        with file_path.open("wb") as buffer:
            while chunk := file.file.read(8192):  # Read in chunks
                buffer.write(chunk)

        is_scanned = False
        length = 1

        if file_ext == "pdf":
            # Directly store the PDF without checking if it's scanned
            length = fitz.open(str(file_path)).page_count
        
        elif file_ext in {"png", "jpg", "jpeg"}:
            # Validate image integrity
            try:
                Image.open(file_path).verify()
            except Exception:
                file_path.unlink()
                raise HTTPException(status_code=400, detail="Invalid image file")

            # Extract text from image
            extracted_text = extract_image_text(str(file_path))
            is_scanned = True
            
            # Generate a new PDF with extracted text
            pdf_filename = filename.rsplit('.', 1)[0] + ".pdf"
            pdf_path = UPLOAD_DIR / pdf_filename
            create_pdf_from_text(extracted_text, str(pdf_path))
            
            # Remove the original image and replace it with the new PDF
            file_path.unlink()
            file_path = pdf_path

        # Create document record in the database
        new_document = Document(
            title=filename,
            user_id=user_id,
            file_path=str(file_path),
            folder_id=folder_id,
            is_scanned=is_scanned,
            progress=0,
            length=length
        )

        db.add(new_document)
        db.commit()
        db.refresh(new_document)

        return {"message": "Document uploaded successfully", "document_id": new_document.document_id}

    except HTTPException:
        raise  # Re-raise FastAPI HTTP exceptions
    except Exception as e:
        logger.error(f"Error uploading file: {e}", exc_info=True)
        # Clean up files in case of error
        if file_path.exists():
            file_path.unlink()
        if pdf_path and pdf_path.exists():
            pdf_path.unlink()
        raise HTTPException(status_code=500, detail="Internal server error")


@document_router.get("/documents/view/{document_id}")
async def view_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.document_id == document_id).first()

    if not document:
        logger.warning(f"Document with ID {document_id} not found in database!")
        raise HTTPException(status_code=404, detail="Document not found")

    logger.info(f"Serving document: {document.file_path}")

    # Convert the local file path to a URL for the frontend
    file_url = f"http://127.0.0.1:8000/uploads/{Path(document.file_path).name}"

    return {
        "document_id": document.document_id,
        "title": document.title,
        "file_path": file_url,  # Return the URL for the frontend
    }


@document_router.get("/documents/{user_id}")
async def get_user_documents(user_id: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching documents for user: {user_id}")
    documents = db.query(Document).filter(Document.user_id == user_id).all()

    if not documents:
        logger.warning(f"No documents found for user: {user_id}")
    else:
        logger.info(f"Documents found: {len(documents)}")

    return {"documents": documents}


@document_router.get("/folders/{folder_id}/documents")
async def get_documents_in_folder(folder_id: int, db: Session = Depends(get_db)):
    """Retrieve all documents within a specific folder."""
    documents = db.query(Document).filter(Document.folder_id == folder_id).all()
    return {"documents": documents}


@document_router.put("/documents/move/{document_id}")
async def move_document(document_id: int, folder_id: int, db: Session = Depends(get_db)):
    """Move a document to another folder."""
    document = db.query(Document).filter(Document.document_id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    document.folder_id = folder_id  # Assign new folder ID
    db.commit()

    return {"message": "Document moved successfully"}


@document_router.delete("/documents/delete/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document permanently."""
    # Log the incoming delete request
    logger.info(f"Received request to delete document with ID: {document_id}")

    # Attempt to retrieve the document from the database
    document = db.query(Document).filter(Document.document_id == document_id).first()

    if not document:
        logger.warning(f"Document with ID {document_id} not found in database!")
        raise HTTPException(status_code=404, detail="Document not found")

    logger.info(f"Found document: {document.title}, file path: {document.file_path}")

    # Log the attempt to delete the file
    try:
        file_path = Path(document.file_path)
        logger.info(f"Attempting to delete file at: {file_path}")
        
        if file_path.exists():
            logger.info(f"File found at {file_path}, deleting it.")
            file_path.unlink()  # Delete the file
        else:
            logger.warning(f"File not found at path: {file_path}")
    except Exception as e:
        logger.error(f"Error deleting file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete file")

    # Log the attempt to delete the document from the database
    try:
        db.delete(document)
        db.commit()
        logger.info(f"Document {document_id} deleted from database successfully.")
    except Exception as e:
        logger.error(f"Error deleting document from database: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete document from database")

    return {"message": "Document deleted successfully"}
