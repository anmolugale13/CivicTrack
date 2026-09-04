import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Category ----------
class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    icon: str
    base_weight: int
    department: str


# ---------- Complaint Updates ----------
class ComplaintUpdateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    author_name: str
    message: str
    new_status: Optional[str] = None
    created_at: datetime.datetime


class ComplaintUpdateCreate(BaseModel):
    message: str
    new_status: Optional[str] = None
    author_name: Optional[str] = "Staff"


# ---------- Complaint ----------
class ComplaintCreate(BaseModel):
    title: str
    description: str
    category_id: int
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_anonymous: Optional[bool] = False
    reporter_name: Optional[str] = None


class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    reference_code: str
    title: str
    description: str
    category: Optional[CategoryOut] = None
    reporter_name: Optional[str] = None
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_path: Optional[str] = None
    status: str
    priority: str
    priority_score: int
    upvotes: int
    is_anonymous: bool
    possible_duplicate_of: Optional[int] = None
    assigned_department: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None


class ComplaintDetailOut(ComplaintOut):
    updates: List[ComplaintUpdateOut] = []


class ComplaintListResponse(BaseModel):
    total: int
    items: List[ComplaintOut]


class StatusUpdatePayload(BaseModel):
    status: str
    message: Optional[str] = None
    author_name: Optional[str] = "Staff"


# ---------- Analytics ----------
class AnalyticsOut(BaseModel):
    total_complaints: int
    resolved: int
    pending: int
    in_progress: int
    rejected: int
    avg_resolution_hours: Optional[float]
    by_category: dict
    by_priority: dict
    by_status: dict
    trend_last_14_days: List[dict]
    sla_breaches: int
