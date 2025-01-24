from fastapi import FastAPI
from backend import models
from .database import engine
from .routers import auth,users,documents
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update this to match your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Creating tables...")
models.Base.metadata.create_all(engine)
print("Tables created successfully!")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(documents.document_router)

UPLOAD_DIR = "uploads"

if not os.path.exists("UPLOAD_DIR"):
    os.mkdir("UPLOAD_DIR")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def home():
    return {"message":"welcome to ASTRA backend"}

