# CivicTrack — Smart Complaint & Public Issue Management System

A centralized platform where residents report public/organizational issues, an automatic
scoring engine triages them by urgency, and staff track each case through to resolution
against a transparent SLA clock.

Built for a hackathon demo, but structured like a real product: FastAPI backend, React +
Tailwind frontend, SQLite database (swappable for Postgres), JWT auth, and a live analytics
dashboard.

---

## Why this scores well

- **A real problem, solved end-to-end.** Citizen-facing report feed *and* staff-facing
  operations dashboard, not just a form.
- **Visible "smart" logic.** Priority scoring is explainable and shown live in the UI —
  judges can see *why* a report is ranked the way it is, both as you type it and after
  submission. No black-box ML claims, just a transparent, defensible heuristic.
- **Duplicate detection.** Text-similarity check flags likely duplicate reports so effort
  isn't wasted working the same pothole five times.
- **SLA awareness.** Every priority tier carries a resolution-time target; breaches surface
  on the dashboard.
- **Production-shaped, not a toy.** Auth, roles, pagination, filtering, file uploads, Docker,
  and a seed script that gives you a populated demo in one command.

---

## Tech stack

| Layer      | Technology                                                   |
|------------|----------------------------------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, React Router, Recharts, Framer Motion, Lucide icons |
| Backend    | Python, FastAPI, SQLAlchemy, Pydantic v2, JWT (python-jose), Passlib/bcrypt |
| Database   | SQLite (file-based, zero setup) — swap the connection string for Postgres in production |
| Deployment | Docker + docker-compose (backend on :8000, frontend on :5173) |

---

## Project structure

```
civictrack/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, static file mount
│   │   ├── models.py          # SQLAlchemy models (User, Complaint, Category, ...)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # JWT + password hashing + role guards
│   │   ├── utils.py           # Priority scoring engine + duplicate detector
│   │   ├── seed.py            # Demo data generator
│   │   └── routers/
│   │       ├── auth_router.py
│   │       ├── complaints_router.py
│   │       └── analytics_router.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/              # Home, Reports, ReportDetail, Submit, Dashboard, ...
│   │   ├── components/         # Navbar, Footer, Badge, ProtectedRoute
│   │   ├── context/AuthContext.jsx
│   │   ├── api/client.js
│   │   └── utils/priorityPreview.js   # client-side mirror of the scoring heuristic
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── start.sh / start.bat        # one-command local run, no Docker needed
└── README.md
```

---

## Quick start (recommended for a live demo)

### Option A — one command, no Docker

Requires Python 3.10+ and Node 18+.

```bash
chmod +x start.sh
./start.sh
```

This creates a virtualenv, installs backend deps, seeds the database, starts the API on
`http://localhost:8000`, installs frontend deps, and starts the app on
`http://localhost:5173`.

On Windows, double-click or run `start.bat` instead.

### Option B — Docker Compose

```bash
docker compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API + docs: [http://localhost:8000/docs](http://localhost:8000/docs)

The backend container seeds demo data automatically on first boot.

### Option C — manual

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m app.seed        # populates demo categories, users, complaints
uvicorn app.main:app --reload --port 8000

# frontend (new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

---

## Demo accounts (seeded)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@civictrack.gov      | admin123    |
| Staff   | staff@civictrack.gov      | staff123    |
| Citizen | citizen@example.com       | citizen123  |

Citizens can also file reports anonymously with no account at all.

---

## Suggested demo flow (for judges)

1. **Home page** — show the live stats pulled straight from the analytics API and the
   "latest on the log" feed.
2. **File a report** (`/submit`) — type a description containing a word like *"gas leak"*
   or *"pothole"* and watch the **live priority preview** update in real time, explaining
   which keyword tipped the score. Submit it.
3. **Public log** (`/reports`) — filter by priority/category/status, upvote a report and
   watch its priority score recompute live.
4. **Log in as staff** (`staff@civictrack.gov`) — open the report, add a status update,
   watch the timeline grow.
5. **Dashboard** (`/dashboard`, staff/admin only) — walk through the status/priority/category
   charts, the 14-day filed-vs-resolved trend, and the SLA breach counter; change a case's
   status inline from the case queue table.

---

## How the priority engine works

`backend/app/utils.py::score_priority()`:

1. Start from the category's base risk weight (e.g. Public Safety starts higher than Noise
   Pollution).
2. Scan the report text for three tiers of urgency language (critical / high / medium
   keyword banks) and add the matching tier's boost — only the highest tier matched counts,
   so wording doesn't stack unfairly.
3. Add a capped bonus for community upvotes (social proof, diminishing returns).
4. Clamp to 0–100 and map to a priority band: **critical (80+), high (60+), medium (35+),
   low (below)**.

This is intentionally a transparent, deterministic heuristic rather than an opaque ML model
— it's fast, needs no training data, and every score can be explained to a resident who asks
"why is my case marked low priority?" The same logic is mirrored client-side in
`frontend/src/utils/priorityPreview.js` for the instant-feedback preview on the submission
form; the server always recalculates authoritatively on submit.

Duplicate detection (`find_possible_duplicate`) compares a new report's text against recent
open reports in the same category using sequence similarity, and flags likely duplicates
above a similarity threshold for staff to merge.

---

## API reference

Full interactive docs (Swagger UI) are auto-generated at `http://localhost:8000/docs` once
the backend is running. Key endpoints:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/complaints/categories`
- `POST /api/complaints` (multipart form, supports image upload, works anonymously)
- `GET /api/complaints` (filters: `status`, `category_id`, `priority`, `search`, `sort`, `page`)
- `GET /api/complaints/{id}`
- `POST /api/complaints/{id}/upvote`
- `PATCH /api/complaints/{id}/status` (staff/admin only)
- `POST /api/complaints/{id}/comment` (staff/admin only)
- `GET /api/analytics`

---

## Extending this for production

- Swap `SQLALCHEMY_DATABASE_URL` in `backend/app/database.py` for a Postgres connection
  string (the schema is already fully SQLAlchemy ORM, no SQLite-specific code).
- Move the uploads directory to S3/GCS-backed storage.
- Add real push/email notifications on status change (the `ComplaintUpdate` model already
  captures every change — hook a notifier onto it).
- Replace the keyword-based scorer with a fine-tuned classifier if you have labeled
  historical complaint data; the interface (`score_priority(text, base_weight, upvotes)`)
  is a drop-in seam for that.

---

## License

Built as a hackathon submission. Use freely for your own demo/coursework.
