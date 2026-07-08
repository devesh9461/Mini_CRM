from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Admin, Lead, Note, ActivityLog
from app.schemas import NoteCreate, NoteResponse
from app.auth import get_current_admin

router = APIRouter(tags=["Notes"])


@router.post("/api/leads/{lead_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    lead_id: int,
    payload: NoteCreate,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Add a new note to a specific lead and log activity."""
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

    # Log Activity
    activity = ActivityLog(
        lead_id=lead_id,
        action="note_added",
        details=f"Added note: '{note.content[:40]}...'",
    )
    db.add(activity)
    db.commit()
    db.refresh(note)

    return NoteResponse.model_validate(note)


@router.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Delete a note and log activity."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    lead_id = note.lead_id
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    lead_name = lead.name if lead else "Unknown"

    activity = ActivityLog(
        lead_id=lead_id,
        action="note_deleted",
        details=f"Deleted note from lead '{lead_name}'",
    )
    db.add(activity)
    db.delete(note)
    db.commit()
    return None
