from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class LeadStatusEnum(str, Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    CONVERTED = "Converted"
    LOST = "Lost"


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class AdminCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse


# ─── Lead Schemas ─────────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    source: str = Field("Website", max_length=100)
    status: LeadStatusEnum = LeadStatusEnum.NEW


class LeadUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    source: Optional[str] = Field(None, max_length=100)
    status: Optional[LeadStatusEnum] = None


class LeadStatusUpdate(BaseModel):
    status: LeadStatusEnum


class NoteResponse(BaseModel):
    id: int
    lead_id: int
    content: str
    follow_up_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LeadResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    source: str
    status: LeadStatusEnum
    created_at: datetime
    updated_at: Optional[datetime] = None
    notes_count: Optional[int] = 0

    class Config:
        from_attributes = True


class LeadDetailResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    source: str
    status: LeadStatusEnum
    created_at: datetime
    updated_at: Optional[datetime] = None
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True


# ─── Note Schemas ─────────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    content: str = Field(..., min_length=1)
    follow_up_date: Optional[date] = None


# ─── Dashboard Schemas ────────────────────────────────────────────────────────

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


# ─── Activity Log Schemas ──────────────────────────────────────────────────────

class ActivityLogResponse(BaseModel):
    id: int
    lead_id: int | None
    action: str
    details: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Duplicate Check ──────────────────────────────────────────────────────────

class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    matches: List[LeadResponse]


# ─── Bulk Import ──────────────────────────────────────────────────────────────

class BulkImportLead(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    source: Optional[str] = Field("Website", max_length=100)
    status: Optional[LeadStatusEnum] = LeadStatusEnum.NEW


class BulkImportRequest(BaseModel):
    leads: List[BulkImportLead]


class BulkImportError(BaseModel):
    row: int
    message: str


class BulkImportResponse(BaseModel):
    imported: int
    errors: List[BulkImportError]


# ─── Pagination ───────────────────────────────────────────────────────────────

class PaginatedLeads(BaseModel):
    leads: List[LeadResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
