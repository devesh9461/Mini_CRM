from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Admin, ActivityLog
from app.schemas import ActivityLogResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/api/activities", tags=["Activities"])


@router.get("/recent", response_model=List[ActivityLogResponse])
def get_recent_activities(
    limit: int = Query(5, ge=1, le=100),
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get the most recent global activity log entries."""
    activities = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [ActivityLogResponse.model_validate(a) for a in activities]


@router.get("", response_model=List[ActivityLogResponse])
def get_lead_activities(
    lead_id: int = Query(..., description="ID of the lead to fetch logs for"),
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get activity logs for a specific lead."""
    activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.lead_id == lead_id)
        .order_by(ActivityLog.created_at.desc())
        .all()
    )
    return [ActivityLogResponse.model_validate(a) for a in activities]
