import os
import shutil
import uuid
import hashlib
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas, auth, utils
from ..database import get_db

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/categories", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name).all()


@router.post("", response_model=schemas.ComplaintDetailOut)
def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category_id: int = Form(...),
    location_text: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    is_anonymous: bool = Form(False),
    reporter_name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(auth.get_current_user),
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    image_path = None
    if image is not None:
        ext = os.path.splitext(image.filename or "")[1] or ".jpg"
        fname = f"{uuid.uuid4().hex}{ext}"
        dest = os.path.join(UPLOAD_DIR, fname)
        with open(dest, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_path = f"/uploads/{fname}"

    score, label = utils.score_priority(f"{title} {description}", category.base_weight, upvotes=0)
    dup_id, dup_ratio = utils.find_possible_duplicate(db, title, description, category_id)

    complaint = models.Complaint(
        reference_code=utils.generate_reference_code(db),
        title=title.strip(),
        description=description.strip(),
        category_id=category_id,
        reporter_id=user.id if user else None,
        reporter_name=(None if not is_anonymous else "Anonymous citizen") if user else (reporter_name or "Anonymous citizen"),
        location_text=location_text,
        latitude=latitude,
        longitude=longitude,
        image_path=image_path,
        status=models.StatusEnum.pending,
        priority=models.PriorityEnum(label),
        priority_score=score,
        is_anonymous=is_anonymous or (user is None and not reporter_name),
        possible_duplicate_of=dup_id,
        assigned_department=category.department,
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    note = f"Complaint registered and auto-scored as {label.upper()} priority (score {score}/100)."
    if dup_id:
        note += f" Possible duplicate of #{dup_id} detected ({dup_ratio}% similar)."
    update = models.ComplaintUpdate(
        complaint_id=complaint.id,
        author_name="CivicTrack AI",
        message=note,
        new_status=models.StatusEnum.pending,
    )
    db.add(update)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("", response_model=schemas.ComplaintListResponse)
def list_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_id: Optional[int] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query("priority", pattern="^(priority|newest|oldest|upvotes)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(models.Complaint)
    if status_filter:
        q = q.filter(models.Complaint.status == status_filter)
    if category_id:
        q = q.filter(models.Complaint.category_id == category_id)
    if priority:
        q = q.filter(models.Complaint.priority == priority)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(models.Complaint.title.ilike(like), models.Complaint.description.ilike(like), models.Complaint.reference_code.ilike(like)))

    total = q.count()

    if sort == "priority":
        q = q.order_by(models.Complaint.priority_score.desc(), models.Complaint.created_at.desc())
    elif sort == "newest":
        q = q.order_by(models.Complaint.created_at.desc())
    elif sort == "oldest":
        q = q.order_by(models.Complaint.created_at.asc())
    elif sort == "upvotes":
        q = q.order_by(models.Complaint.upvotes.desc())

    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return schemas.ComplaintListResponse(total=total, items=items)


@router.get("/{complaint_id}", response_model=schemas.ComplaintDetailOut)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.post("/{complaint_id}/upvote", response_model=schemas.ComplaintOut)
def upvote_complaint(complaint_id: int, request: Request, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    fingerprint = hashlib.sha256(f"{request.client.host}-{complaint_id}".encode()).hexdigest()
    already = db.query(models.Upvote).filter_by(complaint_id=complaint_id, voter_fingerprint=fingerprint).first()
    if already:
        raise HTTPException(status_code=400, detail="You already backed this report")

    db.add(models.Upvote(complaint_id=complaint_id, voter_fingerprint=fingerprint))
    complaint.upvotes += 1
    score, label = utils.score_priority(
        f"{complaint.title} {complaint.description}", complaint.category.base_weight, upvotes=complaint.upvotes
    )
    complaint.priority_score = score
    complaint.priority = models.PriorityEnum(label)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.patch("/{complaint_id}/status", response_model=schemas.ComplaintDetailOut)
def update_status(
    complaint_id: int,
    payload: schemas.StatusUpdatePayload,
    db: Session = Depends(get_db),
    staff: models.User = Depends(auth.require_staff),
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    try:
        new_status = models.StatusEnum(payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    complaint.status = new_status
    if new_status == models.StatusEnum.resolved:
        complaint.resolved_at = datetime.utcnow()

    update = models.ComplaintUpdate(
        complaint_id=complaint.id,
        author_name=staff.name,
        message=payload.message or f"Status changed to {new_status.value.replace('_', ' ').title()}.",
        new_status=new_status,
    )
    db.add(update)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/{complaint_id}/comment", response_model=schemas.ComplaintDetailOut)
def add_comment(
    complaint_id: int,
    payload: schemas.ComplaintUpdateCreate,
    db: Session = Depends(get_db),
    staff: models.User = Depends(auth.require_staff),
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    update = models.ComplaintUpdate(
        complaint_id=complaint.id,
        author_name=staff.name,
        message=payload.message,
        new_status=None,
    )
    db.add(update)
    db.commit()
    db.refresh(complaint)
    return complaint
