import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List

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
from app.config import settings
from app.utils.disposable import is_disposable_email

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get("", response_model=PaginatedLeads)
def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    source_filter: Optional[str] = Query(None, alias="source"),
    sort_by: Optional[str] = Query("created_at"),
    order: Optional[str] = Query("desc"),
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """List all leads with search, filter, sorting, and pagination."""
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
    total_pages = math.ceil(total / per_page) if total > 0 else 0

    # Handle Sorting
    # Default sorting columns
    col = getattr(Lead, sort_by, Lead.created_at)
    if order == "asc":
        query = query.order_by(col.asc())
    else:
        query = query.order_by(col.desc())

    # Paginate
    leads = query.offset((page - 1) * per_page).limit(per_page).all()

    # Batch-load notes_count for all leads in one query to optimize
    if leads:
        lead_ids = [lead.id for lead in leads]
        notes_counts = (
            db.query(Note.lead_id, func.count(Note.id))
            .filter(Note.lead_id.in_(lead_ids))
            .group_by(Note.lead_id)
            .all()
        )
        notes_count_map = {nc[0]: nc[1] for nc in notes_counts}
    else:
        notes_count_map = {}

    lead_responses = []
    for lead in leads:
        lead_data = LeadResponse.model_validate(lead)
        lead_data.notes_count = notes_count_map.get(lead.id, 0)
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
    """Create a new lead and log activity."""
    # Enforce disposable email validation
    if settings.BLOCK_DISPOSABLE_EMAILS and is_disposable_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Leads with disposable or temporary email addresses are not permitted."
        )

    lead = Lead(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        source=payload.source,
        status=payload.status,
    )
    db.add(lead)
    db.flush()
    
    # Log Activity
    activity = ActivityLog(
        lead_id=lead.id,
        action="lead_created",
        details=f"Lead '{lead.name}' created (source: {lead.source})",
    )
    db.add(activity)
    db.commit()
    db.refresh(lead)
    
    lead_data = LeadResponse.model_validate(lead)
    lead_data.notes_count = 0
    return lead_data


# ─── Static endpoints (MUST come before dynamic /{lead_id}) ──────────────────

@router.get("/sources", response_model=List[str])
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
    """Get lead stats counts and recent leads."""
    status_counts = (
        db.query(Lead.status, func.count(Lead.id))
        .group_by(Lead.status)
        .all()
    )
    count_map = {sc[0]: sc[1] for sc in status_counts}
    total = sum(count_map.values()) if count_map else 0
    
    new = count_map.get(LeadStatus.NEW, 0)
    contacted = count_map.get(LeadStatus.CONTACTED, 0)
    converted = count_map.get(LeadStatus.CONVERTED, 0)
    lost = count_map.get(LeadStatus.LOST, 0)

    recent = db.query(Lead).order_by(Lead.created_at.desc()).limit(5).all()

    # Pre-populate notes counts for recent
    recent_responses = []
    if recent:
        lead_ids = [l.id for l in recent]
        notes_counts = (
            db.query(Note.lead_id, func.count(Note.id))
            .filter(Note.lead_id.in_(lead_ids))
            .group_by(Note.lead_id)
            .all()
        )
        notes_count_map = {nc[0]: nc[1] for nc in notes_counts}
        for l in recent:
            l_data = LeadResponse.model_validate(l)
            l_data.notes_count = notes_count_map.get(l.id, 0)
            recent_responses.append(l_data)

    return DashboardStats(
        total_leads=total,
        new_leads=new,
        contacted_leads=contacted,
        converted_leads=converted,
        lost_leads=lost,
        recent_leads=recent_responses,
    )


@router.get("/dashboard/source-stats", response_model=List[SourceStat])
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
    """Check if a lead with the same email or name exists."""
    conditions = []
    if email:
        conditions.append(Lead.email == email)
    if name:
        conditions.append(Lead.name.ilike(name))
        
    if not conditions:
        return DuplicateCheckResponse(is_duplicate=False, matches=[])
        
    matches = db.query(Lead).filter(or_(*conditions)).all()
    
    # Map to response models
    matches_responses = []
    for m in matches:
        m_data = LeadResponse.model_validate(m)
        matches_responses.append(m_data)
        
    return DuplicateCheckResponse(
        is_duplicate=len(matches) > 0,
        matches=matches_responses,
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
    created_leads = []

    for i, lead_data in enumerate(payload.leads):
        try:
            # Validate input manually
            validated = LeadCreate(
                name=lead_data.get("name"),
                email=lead_data.get("email"),
                phone=lead_data.get("phone"),
                source=lead_data.get("source", "Website"),
                status=lead_data.get("status", LeadStatus.NEW),
            )
        except ValidationError as e:
            errors.append(BulkImportError(row=i, message=str(e)))
            continue
        except Exception as e:
            errors.append(BulkImportError(row=i, message=str(e)))
            continue

        # Enforce disposable email validation
        if settings.BLOCK_DISPOSABLE_EMAILS and is_disposable_email(validated.email):
            errors.append(BulkImportError(row=i, message="Leads with disposable or temporary emails are not permitted."))
            continue

        lead = Lead(
            name=validated.name,
            email=validated.email,
            phone=validated.phone,
            source=validated.source,
            status=validated.status,
        )
        db.add(lead)
        db.flush()
        created_leads.append(lead)
        imported += 1

    if created_leads:
        for lead in created_leads:
            db.add(ActivityLog(
                lead_id=lead.id,
                action="lead_created",
                details=f"Lead '{lead.name}' created (bulk import)",
            ))

    if imported > 0 or errors:
        db.commit()

    return BulkImportResponse(imported=imported, errors=errors)


# ─── Dynamic endpoints (/{lead_id}) ──────────────────────────────────────────

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
        
    lead_data = LeadDetailResponse.model_validate(lead)
    lead_data.notes_count = len(lead.notes)
    return lead_data


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
    
    # Check what fields are changing to generate detailed activity logs
    details_list = []
    for field, value in update_data.items():
        old_val = getattr(lead, field)
        if old_val != value:
            details_list.append(f"{field} changed from '{old_val}' to '{value}'")
            setattr(lead, field, value)

    if details_list:
        db.add(ActivityLog(
            lead_id=lead_id,
            action="lead_updated",
            details=" | ".join(details_list),
        ))
        
    db.commit()
    db.refresh(lead)
    
    lead_data = LeadResponse.model_validate(lead)
    lead_data.notes_count = len(lead.notes)
    return lead_data


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
        details=f"Status changed from '{old_status}' to '{payload.status.value}'",
    )
    db.add(activity)
    db.commit()
    db.refresh(lead)
    
    lead_data = LeadResponse.model_validate(lead)
    lead_data.notes_count = len(lead.notes)
    return lead_data


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _current_admin: Admin = Depends(get_current_admin),
):
    """Delete a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Add log entry. Setting lead_id to None in DB will be handled by SET NULL FK constraint
    activity = ActivityLog(
        lead_id=None,
        action="lead_deleted",
        details=f"Lead '{lead.name}' (Email: {lead.email}) was deleted",
    )
    db.add(activity)
    db.delete(lead)
    db.commit()
    return None
