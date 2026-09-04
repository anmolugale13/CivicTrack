import enum
import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, Enum
)
from sqlalchemy.orm import relationship
from .database import Base


class RoleEnum(str, enum.Enum):
    citizen = "citizen"
    staff = "staff"
    admin = "admin"


class StatusEnum(str, enum.Enum):
    pending = "pending"
    acknowledged = "acknowledged"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"


class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.citizen)
    department = Column(String, nullable=True)  # for staff/admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaints = relationship("Complaint", back_populates="reporter", foreign_keys="Complaint.reporter_id")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, default="alert-circle")
    base_weight = Column(Integer, default=40)  # base priority weight 0-100
    department = Column(String, default="General Services")


class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    reference_code = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_name = Column(String, nullable=True)  # for anonymous
    location_text = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_path = Column(String, nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    priority_score = Column(Integer, default=40)
    upvotes = Column(Integer, default=0)
    is_anonymous = Column(Boolean, default=False)
    possible_duplicate_of = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    assigned_department = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", back_populates="complaints", foreign_keys=[reporter_id])
    category = relationship("Category")
    updates = relationship("ComplaintUpdate", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintUpdate.created_at")


class ComplaintUpdate(Base):
    __tablename__ = "complaint_updates"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    author_name = Column(String, default="System")
    message = Column(Text, nullable=False)
    new_status = Column(Enum(StatusEnum), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="updates")


class Upvote(Base):
    __tablename__ = "upvotes"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    voter_fingerprint = Column(String, index=True)  # ip/session based, no login required
