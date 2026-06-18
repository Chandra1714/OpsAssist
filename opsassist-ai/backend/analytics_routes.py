from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import auth, database, incident_model, schemas
from .models import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=schemas.AnalyticsData)
def analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    incidents = (
        db.query(incident_model.Incident)
        .filter(incident_model.Incident.user_id == current_user.id)
        .order_by(incident_model.Incident.created_at.desc())
        .all()
    )

    status_counts: dict[str, int] = {"open": 0, "in progress": 0, "resolved": 0}
    severity_counts: dict[str, int] = {"low": 0, "medium": 0, "high": 0, "critical": 0}

    for incident in incidents:
        status_counts[incident.status.lower()] = status_counts.get(incident.status.lower(), 0) + 1
        severity_counts[incident.severity.lower()] = severity_counts.get(incident.severity.lower(), 0) + 1

    recent_incidents = [
        {
            "id": incident.id,
            "incident_uid": incident.incident_uid,
            "title": incident.title,
            "severity": incident.severity,
            "status": incident.status,
            "created_at": incident.created_at,
            "updated_at": incident.updated_at,
        }
        for incident in incidents[:5]
    ]

    return schemas.AnalyticsData(
        status_counts=status_counts,
        severity_counts=severity_counts,
        recent_incidents=recent_incidents,
    )
