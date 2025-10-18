from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI

from backend.app.core.settings import get_settings

router = APIRouter()


class SessionRequest(BaseModel):
    workflow_id: str
    user_id: str


@router.post("/session")
def create_chatkit_session(req: SessionRequest):
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY no configurado")
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    session = client.beta.chatkit.sessions.create(
        workflow={"id": req.workflow_id},
        user=req.user_id,
    )
    return {"client_secret": session.client_secret}