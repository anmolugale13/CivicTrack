from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=schemas.AnalyticsOut)
def get_analytics(db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).all()
    total = len(complaints)

    by_status = {}
    by_priority = {}
    by_category = {}
    resolution_hours = []
    sla_breaches = 0

    for c in complaints:
        by_status[c.status.value] = by_status.get(c.status.value, 0) + 1
        by_priority[c.priority.value] = by_priority.get(c.priority.value, 0) + 1
        cat_name = c.category.name if c.category else "Uncategorized"
        by_category[cat_name] = by_category.get(cat_name, 0) + 1
        if c.status == models.StatusEnum.resolved and c.resolved_at:
            resolution_hours.append((c.resolved_at - c.created_at).total_seconds() / 3600)
        if utils.is_sla_breached(c):
            sla_breaches += 1

    avg_resolution = round(sum(resolution_hours) / len(resolution_hours), 1) if resolution_hours else None

    trend = []
    today = datetime.utcnow().date()
    for i in range(13, -1, -1):
        day = today - timedelta(days=i)
        count = sum(1 for c in complaints if c.created_at.date() == day)
        resolved_count = sum(1 for c in complaints if c.resolved_at and c.resolved_at.date() == day)
        trend.append({"date": day.isoformat(), "filed": count, "resolved": resolved_count})

    return schemas.AnalyticsOut(
        total_complaints=total,
        resolved=by_status.get("resolved", 0),
        pending=by_status.get("pending", 0),
        in_progress=by_status.get("in_progress", 0),
        rejected=by_status.get("rejected", 0),
        avg_resolution_hours=avg_resolution,
        by_category=by_category,
        by_priority=by_priority,
        by_status=by_status,
        trend_last_14_days=trend,
        sla_breaches=sla_breaches,
    )
