import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import auth_router, complaints_router, analytics_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicTrack API",
    description="Smart Complaint & Public Issue Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router.router)
app.include_router(complaints_router.router)
app.include_router(analytics_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "CivicTrack API"}
