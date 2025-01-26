from fastapi import FastAPI
from backend import models
from .database import engine
from .routers import auth,users,documents
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.controllers.seedvoice import seed_voices
from .routers import audiobook
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

# Call the seed function during startup
seed_voices()


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(documents.document_router)
app.include_router(audiobook.audiobook_router) 

UPLOAD_DIR = "uploads"
AUDIOBOOK_DIR = "audiobooks"

if not os.path.exists("UPLOAD_DIR"):
    os.mkdir("UPLOAD_DIR")

if not os.path.exists(AUDIOBOOK_DIR):
    os.mkdir(AUDIOBOOK_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/audiobooks", StaticFiles(directory=AUDIOBOOK_DIR), name="audiobooks")

@app.get("/")
def home():
    return {"message":"welcome to ASTRA backend"}

