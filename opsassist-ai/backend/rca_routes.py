from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from . import auth, database, incident_model, rca_report, schemas
from .models import User

router = APIRouter(prefix="/incidents", tags=["reports"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{incident_id}/rca")
def generate_rca_report(
    incident_id: int,
    request: schemas.RCARequest,
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

    analysis = {
        "root_cause": f"Preliminary analysis for {incident.title}",
        "duration": "TBD",
        "preventive_actions": [
            "Review deployment and scaling settings.",
            "Validate cluster resource limits.",
        ],
    }
    resolution_notes = request.resolution_notes or "No resolution notes provided."
    if request.format == "docx":
        file_bytes = rca_report.build_rca_docx(incident, analysis, resolution_notes)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        extension = "docx"
    else:
        file_bytes = rca_report.build_rca_pdf(incident, analysis, resolution_notes)
        media_type = "application/pdf"
        extension = "pdf"

    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename=RCA-{incident.incident_uid}.{extension}"
        },
    )
