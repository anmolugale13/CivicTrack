#!/usr/bin/env bash
# CivicTrack — one-command local startup (no Docker required)
set -e

echo "== CivicTrack setup =="

echo "[1/4] Setting up backend virtual environment..."
cd backend
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install --quiet -r requirements.txt

echo "[2/4] Seeding demo database..."
python -m app.seed

echo "[3/4] Starting API on http://localhost:8000 ..."
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
echo $! > backend.pid
cd ..

echo "[4/4] Starting frontend on http://localhost:5173 ..."
cd frontend
npm install --silent
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev -- --host 0.0.0.0 --port 5173
