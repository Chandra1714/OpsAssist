from datetime import datetime
from pydantic import BaseModel


class IncidentBase(BaseModel):
    title: str
    cluster_name: str | None = None
    namespace: str | None = None
    application_name: str | None = None
    severity: str
    status: str | None = "open"
    error_message: str | None = None
    logs: str | None = None
    description: str


class IncidentCreate(IncidentBase):
    pass


class IncidentRead(IncidentBase):
    id: int
    incident_uid: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


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
