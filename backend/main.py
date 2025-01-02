from fastapi import FastAPI
from backend import models
from .database import engine
from .routers import auth,users

app = FastAPI()

print("Creating tables...")
models.Base.metadata.create_all(engine)
print("Tables created successfully!")

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
def home():
    return {"message":"welcome to ASTRA backend"}

