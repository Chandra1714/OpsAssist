from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import ai_service, auth, database, incident_model, incident_schema
from .models import User

router = APIRouter(prefix="/incidents", tags=["incidents"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_incident_uid(db: Session) -> str:
    year = datetime.utcnow().year
    suffix = datetime.utcnow().strftime("%f")[:4]
    uid = f"INC-{year}-{suffix}"
    while db.query(incident_model.Incident).filter(incident_model.Incident.incident_uid == uid).first():
        suffix = str(int(suffix) + 1).zfill(4)[-4:]
        uid = f"INC-{year}-{suffix}"
    return uid


@router.post("/", response_model=incident_schema.IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_create: incident_schema.IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    valid_status = {"open", "in progress", "resolved"}
    status_value = incident_create.status or "open"
    if status_value.lower() not in valid_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid incident status")

    incident = incident_model.Incident(
        incident_uid=generate_incident_uid(db),
        title=incident_create.title,
        cluster_name=incident_create.cluster_name,
        namespace=incident_create.namespace,
        application_name=incident_create.application_name,
        error_message=incident_create.error_message,
        logs=incident_create.logs,
        description=incident_create.description,
        severity=incident_create.severity,
        status=status_value,
        user_id=current_user.id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/", response_model=list[incident_schema.IncidentRead])
def list_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
    query: str | None = None,
    status: str | None = None,
    severity: str | None = None,
    skip: int = 0,
    limit: int = 50,
):
    query_builder = db.query(incident_model.Incident).filter(incident_model.Incident.user_id == current_user.id)

    if status:
        query_builder = query_builder.filter(incident_model.Incident.status.ilike(f"%{status}%"))
    if severity:
        query_builder = query_builder.filter(incident_model.Incident.severity.ilike(f"%{severity}%"))
    if query:
        search = f"%{query}%"
        query_builder = query_builder.filter(
            incident_model.Incident.title.ilike(search)
            | incident_model.Incident.cluster_name.ilike(search)
            | incident_model.Incident.namespace.ilike(search)
            | incident_model.Incident.application_name.ilike(search)
            | incident_model.Incident.error_message.ilike(search)
            | incident_model.Incident.description.ilike(search)
        )

    return (
        query_builder.order_by(incident_model.Incident.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/summary", response_model=incident_schema.IncidentSummary)
def incident_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    incidents = (
        db.query(incident_model.Incident)
        .filter(incident_model.Incident.user_id == current_user.id)
        .all()
    )

    open_incidents = sum(1 for incident in incidents if incident.status.lower() == "open")
    resolved_incidents = sum(1 for incident in incidents if incident.status.lower() == "resolved")
    critical_incidents = sum(1 for incident in incidents if incident.severity.lower() == "critical")

    resolved_durations = [
        (incident.updated_at - incident.created_at).total_seconds() / 60
        for incident in incidents
        if incident.status.lower() == "resolved"
    ]
    average_resolution_time_minutes = (
        sum(resolved_durations) / len(resolved_durations) if resolved_durations else 0.0
    )

    return incident_schema.IncidentSummary(
        open_incidents=open_incidents,
        resolved_incidents=resolved_incidents,
        critical_incidents=critical_incidents,
        average_resolution_time_minutes=round(average_resolution_time_minutes, 1),
    )


@router.get("/{incident_id}/analysis", response_model=incident_schema.AIAnalysis)
def analyze_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    incident = (
        db.query(incident_model.Incident)
        .filter(incident_model.Incident.id == incident_id)
        .filter(incident_model.Incident.user_id == current_user.id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    analysis_result = ai_service.analyze_incident(incident)
    return incident_schema.AIAnalysis(
        incident_id=incident.id,
        summary=analysis_result.get("summary", "No analysis available."),
        recommendations=analysis_result.get("recommendations", []),
        root_cause=analysis_result.get("root_cause"),
        confidence_score=analysis_result.get("confidence_score"),
        suggested_commands=analysis_result.get("suggested_commands"),
    )
