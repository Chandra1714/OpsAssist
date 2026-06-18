from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import ai_service, auth, database, incident_model
from .models import User
from .schemas import ChatRequest, ChatResponse, ChatMessage

router = APIRouter(prefix="/assistant", tags=["assistant"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/chat", response_model=ChatResponse)
def assistant_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    messages = [msg.dict() for msg in request.messages]
    incident = None
    if request.incident_id is not None:
        incident = (
            db.query(incident_model.Incident)
            .filter(incident_model.Incident.id == request.incident_id)
            .filter(incident_model.Incident.user_id == current_user.id)
            .first()
        )
    answer = ai_service.chat_assistant(messages, incident)
    return ChatResponse(messages=[ChatMessage(role="assistant", content=answer)])
