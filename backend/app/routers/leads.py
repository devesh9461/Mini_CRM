import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional

from app.database import get_db
from app.models import Admin, Lead, Note, LeadStatus, ActivityLog
from app.schemas import (
    LeadCreate, LeadUpdate, LeadStatusUpdate,
    LeadResponse, LeadDetailResponse, PaginatedLeads, DashboardStats,
    SourceStat,
    BulkImportRequest, BulkImportResponse, BulkImportError,
    DuplicateCheckResponse,
)
from app.auth import get_current_admin

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get("", response_model=PaginatedLeads)
def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    source_filter: Optional[str] = Query(None, alias="source"),
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """List all leads with search, filter, and pagination."""
    query = db.query(Lead)

    # Search by name or email
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(Lead.name.ilike(search_term), Lead.email.ilike(search_term))
        )

    # Filter by status
    if status_filter:
        query = query.filter(Lead.status == status_filter)

    # Filter by source
    if source_filter:
        query = query.filter(Lead.source == source_filter)

    # Get total count
    total = query.count()
    total_pages = math.ceil(total / per_page) if total > 0 else 1

    # Paginate
    leads = query.order_by(Lead.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    # Add notes_count to each lead
    lead_responses = []
    for lead in leads:
        notes_count = db.query(func.count(Note.id)).filter(Note.lead_id == lead.id).scalar()
        lead_data = LeadResponse.model_validate(lead)
        lead_data.notes_count = notes_count
        lead_responses.append(lead_data)

    return PaginatedLeads(
        leads=lead_responses,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Create a new lead."""
    lead = Lead(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        source=payload.source,
        status=payload.status,
    )
    db.add(lead)
    db.flush()
    activity = ActivityLog(
        lead_id=lead.id,
        action="lead_created",
        details=f"Lead '{lead.name}' created",
    )
    db.add(activity)
    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


# ─── Static routes MUST come before dynamic /{lead_id} ───────────────────────

@router.get("/sources", response_model=list[str])
def get_sources(
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get all unique lead sources."""
    sources = db.query(Lead.source).distinct().all()
    return [s[0] for s in sources if s[0]]


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get dashboard statistics."""
    total = db.query(func.count(Lead.id)).scalar()
    new = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.NEW).scalar()
    contacted = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.CONTACTED).scalar()
    converted = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.CONVERTED).scalar()
    lost = db.query(func.count(Lead.id)).filter(Lead.status == LeadStatus.LOST).scalar()

    recent = db.query(Lead).order_by(Lead.created_at.desc()).limit(5).all()

    return DashboardStats(
        total_leads=total,
        new_leads=new,
        contacted_leads=contacted,
        converted_leads=converted,
        lost_leads=lost,
        recent_leads=[LeadResponse.model_validate(l) for l in recent],
    )


@router.get("/dashboard/source-stats", response_model=list[SourceStat])
def get_source_stats(
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get lead counts grouped by source."""
    rows = db.query(Lead.source, func.count(Lead.id)).group_by(Lead.source).all()
    return [SourceStat(source=row[0], count=row[1]) for row in rows]


@router.get("/duplicate", response_model=DuplicateCheckResponse)
def check_duplicate(
    email: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Check if a lead with the same email (exact) or name (case-insensitive) exists."""
    conditions = []
    if email:
        conditions.append(Lead.email == email)
    if name:
        conditions.append(Lead.name.ilike(name))
    if not conditions:
        return DuplicateCheckResponse(is_duplicate=False, matches=[])
    matches = db.query(Lead).filter(or_(*conditions)).all()
    return DuplicateCheckResponse(
        is_duplicate=len(matches) > 0,
        matches=[LeadResponse.model_validate(m) for m in matches],
    )


@router.post("/bulk", response_model=BulkImportResponse)
def bulk_import(
    payload: BulkImportRequest,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Bulk import leads. Wraps all inserts in a single transaction."""
    imported = 0
    errors = []

    for i, lead_data in enumerate(payload.leads):
        try:
            validated = LeadCreate(**lead_data.model_dump())
        except ValidationError as e:
            errors.append(BulkImportError(row=i, message=str(e)))
            continue

        lead = Lead(
            name=validated.name,
            email=validated.email,
            phone=validated.phone,
            source=validated.source,
            status=validated.status,
        )
        db.add(lead)
        imported += 1

    if imported > 0 or errors:
        db.commit()

    return BulkImportResponse(imported=imported, errors=errors)


# ─── Dynamic routes ──────────────────────────────────────────────────────────

@router.get("/{lead_id}", response_model=LeadDetailResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Get a single lead with all its notes."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadDetailResponse.model_validate(lead)


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Update a lead's details."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.patch("/{lead_id}/status", response_model=LeadResponse)
def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Quick status update for a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    old_status = lead.status.value
    lead.status = payload.status

    activity = ActivityLog(
        lead_id=lead_id,
        action="status_changed",
        details=f"Status changed from {old_status} to {payload.status.value}",
    )
    db.add(activity)
    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Delete a lead and all associated notes."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    activity = ActivityLog(
        lead_id=lead.id,
        action="lead_deleted",
        details=f"Lead '{lead.name}' deleted",
    )
    db.add(activity)
    db.delete(lead)
    db.commit()
    return None
