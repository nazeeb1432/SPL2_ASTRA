from fastapi import FastAPI
from backend import models
from .database import engine
from .routers import auth,users
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def home():
    return {"message":"welcome to ASTRA backend"}

