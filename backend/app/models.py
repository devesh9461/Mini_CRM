import enum
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Date, Enum, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class LeadStatus(str, enum.Enum):
    """Possible statuses for a lead."""
    NEW = "New"
    CONTACTED = "Contacted"
    CONVERTED = "Converted"
    LOST = "Lost"


class Admin(Base):
    """Admin user who can log in and manage leads."""
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Lead(Base):
    """A client lead generated from a website contact form."""
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    source = Column(String(100), nullable=False, default="Website")
    status = Column(
        Enum(LeadStatus),
        nullable=False,
        default=LeadStatus.NEW,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationship
    notes = relationship(
        "Note", back_populates="lead", cascade="all, delete-orphan",
        order_by="Note.created_at.desc()"
    )


class Note(Base):
    """A note or follow-up entry attached to a lead."""
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(
        Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content = Column(Text, nullable=False)
    follow_up_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    lead = relationship("Lead", back_populates="notes")


class ActivityLog(Base):
    """Activity audit log for tracking actions on leads."""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lead_id = Column(
        Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=True, index=True
    )
    action = Column(String(50))  # e.g. 'lead_created', 'status_changed', 'note_added', 'lead_deleted'
    details = Column(Text, nullable=True)  # human-readable description
    created_at = Column(DateTime(timezone=True), server_default=func.now())
