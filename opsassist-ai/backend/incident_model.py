from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_uid = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(180), nullable=False)
    cluster_name = Column(String(120), nullable=True)
    namespace = Column(String(120), nullable=True)
    application_name = Column(String(120), nullable=True)
    error_message = Column(Text, nullable=True)
    logs = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    severity = Column(String(32), nullable=False, default="medium")
    status = Column(String(32), nullable=False, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="incidents")
