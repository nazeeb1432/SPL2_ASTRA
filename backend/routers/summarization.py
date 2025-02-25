from fastapi import FastAPI, HTTPException,APIRouter
from pydantic import BaseModel
import google.generativeai as genai
from .. import schemas


router=APIRouter(
    prefix="/api",
    tags=['Summarization']
)

# Configure Gemini API
genai.configure(api_key="AIzaSyDC7jDlT-bCn6J5zZaPSsQiKg8Ow9b_8xc")

# Create the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

@router.post("/summarize")
async def summarize(request: schemas.TextRequest):
    try:
        response = model.generate_content(f"Summarize this: {request.text}")
        print(response.text)#print the response
        return {"summary": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/generate-keywords")
async def generate_keywords(request: schemas.TextRequest):
    try:
        response = model.generate_content(f"Generate main keywords (numbered) to grasp insight of the content: {request.text}")
        print(response.text)#print the response
        return {"keywords": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


