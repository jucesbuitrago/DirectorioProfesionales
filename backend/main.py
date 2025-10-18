from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configurar CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class SessionRequest(BaseModel):
    workflow_id: str
    user_id: str

@app.post("/api/chatkit/session")
def create_chatkit_session(req: SessionRequest):
    session = client.beta.chatkit.sessions.create(
        workflow={"id": req.workflow_id},
        user=req.user_id
    )
    return {"client_secret": session.client_secret}