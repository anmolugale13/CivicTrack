"""
Seeds CivicTrack with demo categories, users, and a realistic spread of complaints
so the dashboard, analytics, and priority engine all have something to show.
Run with: python -m app.seed
"""
import random
from datetime import datetime, timedelta

from .database import Base, engine, SessionLocal
from . import models, auth, utils

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ---------------- Categories ----------------
CATEGORIES = [
    ("Roads & Potholes", "road", 32, "Public Works"),
    ("Water Supply", "droplet", 40, "Water Board"),
    ("Electricity & Streetlights", "zap", 36, "Electricity Dept"),
    ("Sanitation & Garbage", "trash-2", 28, "Sanitation Dept"),
    ("Public Safety", "shield-alert", 48, "Police & Safety"),
    ("Sewage & Drainage", "waves", 40, "Water Board"),
    ("Illegal Construction", "building-2", 24, "Urban Planning"),
    ("Stray Animals", "dog", 20, "Animal Control"),
    ("Noise Pollution", "volume-2", 16, "Environment Dept"),
    ("Parks & Public Spaces", "trees", 16, "Parks Dept"),
]

cat_objs = {}
for name, icon, weight, dept in CATEGORIES:
    c = models.Category(name=name, icon=icon, base_weight=weight, department=dept)
    db.add(c)
    db.flush()
    cat_objs[name] = c

# ---------------- Users ----------------
users = [
    ("Aarav Sharma", "admin@civictrack.gov", "admin123", models.RoleEnum.admin, "Municipal Administration"),
    ("Priya Nair", "staff@civictrack.gov", "staff123", models.RoleEnum.staff, "Public Works"),
    ("Rohan Mehta", "citizen@example.com", "citizen123", models.RoleEnum.citizen, None),
    ("Sneha Iyer", "sneha@example.com", "citizen123", models.RoleEnum.citizen, None),
    ("Kabir Khan", "kabir@example.com", "citizen123", models.RoleEnum.citizen, None),
]
user_objs = []
for name, email, pw, role, dept in users:
    u = models.User(name=name, email=email, hashed_password=auth.hash_password(pw), role=role, department=dept)
    db.add(u)
    db.flush()
    user_objs.append(u)

citizen_users = [u for u in user_objs if u.role == models.RoleEnum.citizen]

# ---------------- Complaints ----------------
SAMPLE_COMPLAINTS = [
    ("Deep pothole causing accidents on MG Road", "There is a large, deep pothole near the MG Road signal that has already caused two bike accidents this week. It's dangerous, especially at night.", "Roads & Potholes"),
    ("No water supply in Sector 12 for 3 days", "Our entire block has had no water supply for three days. Several elderly residents are struggling. This is urgent.", "Water Supply"),
    ("Streetlight not working near school", "The streetlight outside the primary school has been off for two weeks, making it unsafe for children walking home in the evening.", "Electricity & Streetlights"),
    ("Garbage not collected for a week", "Garbage bins on Park Street are overflowing and haven't been collected in over a week. Bad smell and rats spotted.", "Sanitation & Garbage"),
    ("Open manhole on Church Road, extremely dangerous", "There's an open manhole with no barricade on Church Road. It's a serious hazard, someone could fall in, especially at night.", "Sewage & Drainage"),
    ("Suspicious activity and theft reports in Green Colony", "Multiple residents have reported theft attempts in Green Colony over the past week. We need increased patrolling urgently.", "Public Safety"),
    ("Illegal construction blocking public pathway", "A building extension has completely blocked the public footpath on 4th Cross Street without any permit visible.", "Illegal Construction"),
    ("Pack of stray dogs chasing pedestrians", "A pack of aggressive stray dogs near the bus stop has been chasing pedestrians and cyclists. A child was almost bitten.", "Stray Animals"),
    ("Loud construction noise before 6 AM", "Construction work at the new complex starts as early as 5 AM daily, violating noise pollution norms and disturbing sleep.", "Noise Pollution"),
    ("Broken swings and unsafe play equipment at park", "The children's play area at Lakeview Park has broken swings with exposed sharp edges. Needs urgent repair.", "Parks & Public Spaces"),
    ("Water leak flooding the main road", "A major pipeline leak is flooding the main road near the market, wasting water and creating traffic issues.", "Water Supply"),
    ("Power outage in entire ward since morning", "Blackout since 7 AM today in the whole ward, no communication from the electricity department on when it will be restored.", "Electricity & Streetlights"),
    ("Sewage overflow near residential area", "Raw sewage is overflowing onto the street near House No. 45, creating a serious health hazard for the whole street.", "Sewage & Drainage"),
    ("Uncollected garbage attracting stray animals", "Garbage pile near the community hall hasn't been cleared, now attracting stray dogs and pigs. Health risk to residents.", "Sanitation & Garbage"),
    ("Damaged road divider causing traffic hazard", "The road divider near the flyover is broken and creating a hazard for two-wheelers, especially at night.", "Roads & Potholes"),
    ("Encroachment on public parking space", "Shop owners have encroached on the public parking area, forcing residents to park on the main road.", "Illegal Construction"),
    ("Faulty traffic signal causing congestion", "The traffic signal at the main junction has been malfunctioning for two days, causing massive congestion during peak hours.", "Roads & Potholes"),
    ("Unattended garbage dump near children's park", "A large unauthorized garbage dump has formed right next to the children's park, it's an eyesore and health hazard.", "Sanitation & Garbage"),
    ("Broken footpath tiles causing falls", "Several elderly residents have tripped over broken footpath tiles on Station Road. Needs quick repair.", "Roads & Potholes"),
    ("Contaminated drinking water reported", "Residents report discolored, foul smelling water from the municipal supply line since yesterday. Possible contamination.", "Water Supply"),
    ("Streetlights flickering all night", "Streetlights on Lake Road flicker constantly all night, wasting electricity and being generally unreliable.", "Electricity & Streetlights"),
    ("Public toilet in unusable condition", "The public toilet near the bus stand is in an extremely unhygienic condition and has been unusable for weeks.", "Sanitation & Garbage"),
    ("Tree branch about to fall on power line", "A large tree branch is leaning dangerously close to the power line after last night's storm, risk of a fire hazard.", "Public Safety"),
    ("Unauthorized loudspeaker use late at night", "Wedding function nearby is using loudspeakers well past the permitted 10 PM limit, disturbing the whole neighborhood.", "Noise Pollution"),
    ("Park benches vandalized and unsafe", "Several benches in Rose Garden Park are vandalized with sharp broken edges, unsafe for visitors, especially children.", "Parks & Public Spaces"),
]

STATUSES_WEIGHTED = (
    [models.StatusEnum.pending] * 6
    + [models.StatusEnum.acknowledged] * 4
    + [models.StatusEnum.in_progress] * 6
    + [models.StatusEnum.resolved] * 7
    + [models.StatusEnum.rejected] * 2
)

now = datetime.utcnow()

for i, (title, desc, cat_name) in enumerate(SAMPLE_COMPLAINTS):
    category = cat_objs[cat_name]
    created_days_ago = random.randint(0, 20)
    created_at = now - timedelta(days=created_days_ago, hours=random.randint(0, 23))
    status = random.choice(STATUSES_WEIGHTED)
    upvotes = random.randint(0, 34)

    score, label = utils.score_priority(f"{title} {desc}", category.base_weight, upvotes=upvotes)
    reporter = random.choice(citizen_users)
    is_anon = random.random() < 0.25

    complaint = models.Complaint(
        reference_code=f"CX-{created_at.strftime('%y%m')}-{1000+i}",
        title=title,
        description=desc,
        category_id=category.id,
        reporter_id=reporter.id,
        reporter_name="Anonymous citizen" if is_anon else reporter.name,
        location_text=random.choice([
            "Ward 7, MG Road", "Sector 12, Green Colony", "Near Central Bus Stand",
            "4th Cross Street", "Lakeview Park", "Station Road", "Church Road, Ward 3",
        ]),
        latitude=12.9716 + random.uniform(-0.05, 0.05),
        longitude=77.5946 + random.uniform(-0.05, 0.05),
        status=status,
        priority=models.PriorityEnum(label),
        priority_score=score,
        upvotes=upvotes,
        is_anonymous=is_anon,
        assigned_department=category.department,
        created_at=created_at,
        updated_at=created_at,
    )

    if status == models.StatusEnum.resolved:
        complaint.resolved_at = created_at + timedelta(hours=random.randint(6, 140))

    db.add(complaint)
    db.flush()

    db.add(models.ComplaintUpdate(
        complaint_id=complaint.id,
        author_name="CivicTrack AI",
        message=f"Complaint registered and auto-scored as {label.upper()} priority (score {score}/100).",
        new_status=models.StatusEnum.pending,
        created_at=created_at,
    ))
    if status != models.StatusEnum.pending:
        db.add(models.ComplaintUpdate(
            complaint_id=complaint.id,
            author_name="Priya Nair",
            message=f"Status updated to {status.value.replace('_', ' ').title()} by {category.department}.",
            new_status=status,
            created_at=created_at + timedelta(hours=random.randint(2, 48)),
        ))

db.commit()
db.close()

print("Seed complete: 10 categories, 5 users, 25 complaints.")
print("Login  Admin: admin@civictrack.gov / admin123")
print("Login  Staff: staff@civictrack.gov / staff123")
print("Login  Citizen: citizen@example.com / citizen123")
