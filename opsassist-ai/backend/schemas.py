from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str
    role: str = "engineer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class UserRead(UserBase):
    id: int
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class AIAnalysis(BaseModel):
    incident_id: int
    summary: str
    recommendations: list[str]
    root_cause: str | None = None
    confidence_score: float | None = None
    suggested_commands: list[str] | None = None


class IncidentSummary(BaseModel):
    open_incidents: int
    resolved_incidents: int
    critical_incidents: int
    average_resolution_time_minutes: float


class RCARequest(BaseModel):
    format: str = "pdf"
    resolution_notes: str | None = None


class KnowledgeBaseItemCreate(BaseModel):
    title: str
    content: str
    tags: str | None = None


class KnowledgeBaseItemRead(KnowledgeBaseItemCreate):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    incident_id: int | None = None


class ChatResponse(BaseModel):
    messages: list[ChatMessage]


class AnalyticsData(BaseModel):
    status_counts: dict[str, int]
    severity_counts: dict[str, int]
    recent_incidents: list[dict]
