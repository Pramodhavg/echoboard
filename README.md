# Mini Feedback App

Backend: FastAPI + SQLite
Frontend: React (Vite)
Optional AI enrichment via n8n webhook.

## Dev quickstart
cd backend
python -m venv .venv
# (activate venv)
pip install -r requirements.txt
uvicorn app:app --reload