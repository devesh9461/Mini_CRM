from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List
from app.models import LeadStatus


# -----------------------------------------------------------------------------
# Auth Schemas
# -----------------------------------------------------------------------------

class AdminBase(BaseModel):
    username: str
    email: EmailStr


class AdminCreate(AdminBase):
    password: str


class AdminResponse(AdminBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    admin: AdminResponse


class TokenData(BaseModel):
    username: Optional[str] = None


# -----------------------------------------------------------------------------
# Note Schemas
# -----------------------------------------------------------------------------

class NoteBase(BaseModel):
    content: str
    follow_up_date: Optional[date] = None


class NoteCreate(NoteBase):
    pass


class NoteResponse(NoteBase):
    id: int
    lead_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Lead Schemas
# -----------------------------------------------------------------------------

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: Optional[str] = "Website"
    status: Optional[LeadStatus] = LeadStatus.NEW


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    status: Optional[LeadStatus] = None


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadResponse(LeadBase):
    id: int
    created_at: datetime
    updated_at: datetime
    notes_count: Optional[int] = 0

    class Config:
        from_attributes = True


class LeadDetailResponse(LeadResponse):
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True


class PaginatedLeads(BaseModel):
    leads: List[LeadResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# -----------------------------------------------------------------------------
# Dashboard & Stats Schemas
# -----------------------------------------------------------------------------

class DashboardStats(BaseModel):
    total_leads: int
    new_leads: int
    contacted_leads: int
    converted_leads: int
    lost_leads: int
    recent_leads: List[LeadResponse]


class SourceStat(BaseModel):
    source: str
    count: int


# -----------------------------------------------------------------------------
# Duplicate Check Schemas
# -----------------------------------------------------------------------------

class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    matches: List[LeadResponse]


# -----------------------------------------------------------------------------
# Bulk Import Schemas
# -----------------------------------------------------------------------------

class BulkImportError(BaseModel):
    row: int
    message: str


class BulkImportRequest(BaseModel):
    leads: List[dict]


class BulkImportResponse(BaseModel):
    imported: int
    errors: List[BulkImportError]


# -----------------------------------------------------------------------------
# Activity Log Schemas
# -----------------------------------------------------------------------------

class ActivityLogResponse(BaseModel):
    id: int
    lead_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
