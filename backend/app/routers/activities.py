from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Admin, ActivityLog
from app.schemas import ActivityLogResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/api/activities", tags=["Activities"])


@router.get("", response_model=list[ActivityLogResponse])
def get_activities(
    lead_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get activities for a specific lead (or all if no lead_id)."""
    query = db.query(ActivityLog).order_by(ActivityLog.created_at.desc())
    if lead_id is not None:
        query = query.filter(ActivityLog.lead_id == lead_id)
    activities = query.all()
    return [ActivityLogResponse.model_validate(a) for a in activities]


@router.get("/recent", response_model=list[ActivityLogResponse])
def get_recent_activities(
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get recent activities across all leads."""
    activities = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [ActivityLogResponse.model_validate(a) for a in activities]
