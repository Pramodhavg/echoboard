# EchoBoard — Mini Feedback App (FastAPI + React/Vite)

A small full-stack application that lets users submit feedback and view all submissions.

- Frontend: React (Vite)
- Backend: FastAPI
- Storage: SQLite
- Endpoints:
  - `POST /api/feedback` — create `{ name, message }`
  - `GET  /api/feedback` — list all (newest first)

---

## Project Structure

mini-feedback-app/
├─ backend/
│ ├─ app.py
│ ├─ requirements.txt
│ ├─ .env.example
│ └─ (feedback.db created at runtime; ignored by git)
└─ frontend/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
├─ App.jsx
├─ api.js
├─ styles.css
└─ main.jsx


---

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Git

---

## Quick Start

### 1) Backend (FastAPI)

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
. .venv/Scripts/Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt

# Create your env file from the template
# Windows
copy .env.example .env
# macOS/Linux
# cp .env.example .env

# Start the API (http://127.0.0.1:8000, docs at /docs)
uvicorn app:app --reload --port 8000


## backend/.env
# path is relative to backend/
DATABASE_PATH=feedback.db

# allow the Vite dev server to call the API
CORS_ORIGINS=http://localhost:5173

# leave empty to disable enrichment
N8N_WEBHOOK_URL=

Frontend (React/Vite):
cd frontend
npm install

# Optional: explicitly set the API URL for Vite dev
# This file can be committed for convenience.
# Windows
echo VITE_API_URL=http://127.0.0.1:8000 > .env.development
# macOS/Linux
# printf "VITE_API_URL=http://127.0.0.1:8000\n" > .env.development

npm run dev
# app opens on http://localhost:5173

Sample Requests
Create feedback:
curl -X POST http://127.0.0.1:8000/api/feedback \
  -H "content-type: application/json" \
  -d "{\"name\":\"Ava\",\"message\":\"Great experience !!\"}"


List feedback:
curl http://127.0.0.1:8000/api/feedback

Notes and Decisions
--> Storage is a local SQLite file (backend/feedback.db), created automatically.
--> The UI shows badges for positive, mixed, and negative. Neutral is intentionally hidden.
--> Summary label reads “Summary:” to avoid implying an external AI requirement.
--> The app works fully offline without any enrichment webhook configured.

Troubleshooting
Port in use:
--> Backend: change --port for uvicorn or stop the conflicting process.
--> Frontend: npm run dev -- --port 5174 and update VITE_API_URL if needed.
--> CORS: ensure CORS_ORIGINS in backend/.env matches your Vite URL.
--> Reset DB: stop the backend, delete backend/feedback.db, restart the API.

Scripts Reference
Backend:
# from backend/
uvicorn app:app --reload --port 8000

Frontend:
# from frontend/
npm run dev
npm run build
npm run preview

What’s Implemented:
--> Submit feedback (name + message) and list all feedback.
--> Persistence via SQLite.
--> Clean UI with filtering by sentiment and a text search.
--> Environment-driven configuration for both frontend and backend.
