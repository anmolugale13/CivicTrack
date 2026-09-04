@echo off
echo == CivicTrack setup ==

echo [1/4] Setting up backend virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install --quiet -r requirements.txt

echo [2/4] Seeding demo database...
python -m app.seed

echo [3/4] Starting API on http://localhost:8000 ...
start "CivicTrack API" cmd /k uvicorn app.main:app --host 0.0.0.0 --port 8000
cd ..

echo [4/4] Starting frontend on http://localhost:5173 ...
cd frontend
call npm install
echo VITE_API_URL=http://localhost:8000 > .env
call npm run dev -- --host 0.0.0.0 --port 5173
