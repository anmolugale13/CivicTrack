import random
import string
import difflib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models

# Keyword banks used for lightweight, explainable NLP-style urgency scoring.
CRITICAL_KEYWORDS = [
    "fire", "explosion", "collapse", "gas leak", "electrocut", "drowning",
    "life threatening", "life-threatening", "child", "children", "unconscious",
    "sparking wire", "live wire", "flood", "structural crack", "poison",
    "sewage overflow", "attack", "accident", "bleeding", "trapped"
]
HIGH_KEYWORDS = [
    "danger", "dangerous", "urgent", "emergency", "leak", "broken pipe",
    "no water", "power outage", "blackout", "open manhole", "pothole",
    "garbage pile", "stray dog", "harassment", "theft", "robbery",
    "blocked drain", "contaminated", "outbreak", "injury", "hazard"
]
MEDIUM_KEYWORDS = [
    "noise", "streetlight", "street light", "garbage", "littering",
    "parking", "encroachment", "illegal construction", "water supply",
    "traffic signal", "stray", "damaged road", "overflowing bin"
]

STOPWORDS = {"the", "a", "an", "is", "are", "of", "in", "on", "at", "to", "and", "for", "near", "my", "with"}


def generate_reference_code(db: Session) -> str:
    while True:
        code = "CX-" + datetime.utcnow().strftime("%y%m") + "-" + "".join(
            random.choices(string.digits, k=4)
        )
        exists = db.query(models.Complaint).filter_by(reference_code=code).first()
        if not exists:
            return code


def score_priority(text: str, category_base_weight: int, upvotes: int = 0) -> tuple[int, str]:
    """
    Returns (score 0-100, priority label).
    Explainable heuristic: base category weight + keyword urgency boost + social proof (upvotes),
    capped at 100. This stands in for an ML/NLP classifier while staying fully transparent
    and deterministic for a live demo.
    """
    t = text.lower()
    score = category_base_weight

    if any(k in t for k in CRITICAL_KEYWORDS):
        score += 28
    elif any(k in t for k in HIGH_KEYWORDS):
        score += 16
    elif any(k in t for k in MEDIUM_KEYWORDS):
        score += 6

    # social proof: each upvote nudges priority, diminishing returns
    score += min(upvotes * 1, 12)

    score = max(0, min(100, score))

    if score >= 80:
        label = "critical"
    elif score >= 60:
        label = "high"
    elif score >= 35:
        label = "medium"
    else:
        label = "low"

    return score, label


def find_possible_duplicate(db: Session, title: str, description: str, category_id: int):
    """
    Lightweight duplicate detector: compares new complaint text against recent OPEN
    complaints in the same category using sequence similarity. Flags matches above
    a similarity threshold so staff can merge/link reports instead of duplicating work.
    """
    candidate_text = f"{title} {description}".lower()
    open_statuses = [models.StatusEnum.pending, models.StatusEnum.acknowledged, models.StatusEnum.in_progress]
    recent = (
        db.query(models.Complaint)
        .filter(models.Complaint.category_id == category_id)
        .filter(models.Complaint.status.in_(open_statuses))
        .order_by(models.Complaint.created_at.desc())
        .limit(50)
        .all()
    )
    best_match = None
    best_ratio = 0.0
    for c in recent:
        existing_text = f"{c.title} {c.description}".lower()
        ratio = difflib.SequenceMatcher(None, candidate_text, existing_text).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_match = c

    if best_match and best_ratio >= 0.55:
        return best_match.id, round(best_ratio * 100, 1)
    return None, 0.0


def sla_hours_for_priority(priority: str) -> int:
    return {
        "critical": 24,
        "high": 72,
        "medium": 168,   # 7 days
        "low": 336,      # 14 days
    }.get(priority, 168)


def is_sla_breached(complaint: models.Complaint) -> bool:
    if complaint.status in (models.StatusEnum.resolved, models.StatusEnum.rejected):
        return False
    deadline = complaint.created_at + timedelta(hours=sla_hours_for_priority(complaint.priority.value if hasattr(complaint.priority, "value") else complaint.priority))
    return datetime.utcnow() > deadline
