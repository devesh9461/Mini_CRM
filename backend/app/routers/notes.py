from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Admin, Lead, Note, ActivityLog
from app.schemas import NoteCreate, NoteResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/api", tags=["Notes"])


@router.get("/leads/{lead_id}/notes", response_model=list[NoteResponse])
def get_notes(
    lead_id: int,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get all notes for a specific lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    notes = (
        db.query(Note)
        .filter(Note.lead_id == lead_id)
        .order_by(Note.created_at.desc())
        .all()
    )
    return [NoteResponse.model_validate(n) for n in notes]


@router.post(
    "/leads/{lead_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    lead_id: int,
    payload: NoteCreate,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Add a note or follow-up to a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    note = Note(
        lead_id=lead_id,
        content=payload.content,
        follow_up_date=payload.follow_up_date,
    )
    db.add(note)
    db.flush()
    activity = ActivityLog(
        lead_id=lead_id,
        action="note_added",
        details="Note added to lead",
    )
    db.add(activity)
    db.commit()
    db.refresh(note)
    return NoteResponse.model_validate(note)


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Delete a note."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None
