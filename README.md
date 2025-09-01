EchoBoard — Mini Feedback App (FastAPI + React/Vite)

A small full-stack application that lets users submit feedback and view all submissions.

Frontend: React (Vite)

Backend: FastAPI

Storage: SQLite

Endpoints

POST /api/feedback — create { name, message }

GET /api/feedback — list all (newest first)

Project Structure
echoboard/
├─ backend/
│  ├─ app.py
│  ├─ requirements.txt
│  ├─ .env.example
│  └─ (feedback.db is created at runtime; ignored by git)
└─ frontend/
   ├─ index.html
   ├─ package.json
   ├─ vite.config.js
   └─ src/
      ├─ App.jsx
      ├─ api.js
      ├─ styles.css
      └─ main.jsx

Prerequisites

Python 3.10+

Node.js 18+ and npm

Git

Quick Start
1) Clone
git clone https://github.com/Pramodhavg/echoboard
cd echoboard

2) Backend (FastAPI)
cd backend
python -m venv .venv


Activate the virtual environment

Windows (PowerShell)

. .venv/Scripts/Activate.ps1


macOS / Linux

source .venv/bin/activate


Install dependencies

pip install -r requirements.txt


Create your env file from the template

Windows

copy .env.example .env


macOS / Linux

cp .env.example .env


Run the API (docs at /docs)

uvicorn app:app --reload --port 8000


backend/.env contents reference

# relative to backend/
DATABASE_PATH=feedback.db

# allow the Vite dev server to call the API
CORS_ORIGINS=http://localhost:5173

# leave empty to disable enrichment
N8N_WEBHOOK_URL=

3) Frontend (React/Vite)
cd ../frontend
npm install


Set the API URL for Vite dev (optional but convenient)

Windows

echo VITE_API_URL=http://127.0.0.1:8000 > .env.development


macOS / Linux

printf "VITE_API_URL=http://127.0.0.1:8000\n" > .env.development


Run the dev server

npm run dev


Open the app at: http://localhost:5173

Sample Requests

Create feedback

curl -X POST http://127.0.0.1:8000/api/feedback \
  -H "content-type: application/json" \
  -d '{"name":"Ava","message":"Great experience !!"}'


List feedback

curl http://127.0.0.1:8000/api/feedback

Notes and Decisions

Storage uses a local SQLite database at backend/feedback.db (created automatically).

UI shows badges for positive, mixed, and negative; neutral is intentionally hidden.

The label reads “Summary:”.

The app runs fully offline without any enrichment configured.

Optional: Enable Enrichment with n8n

Start n8n locally

npx --yes n8n


Editor opens at http://localhost:5678.

Import the workflow

Click Import in the editor and choose the file in the repo root:

Feedback Enrich.json

Click Activate.

Copy the Production Webhook URL from the Webhook node
(looks like http://localhost:5678/webhook/ai/feedback-enrich).

Put it in backend/.env and restart the API

N8N_WEBHOOK_URL=http://127.0.0.1:5678/webhook/ai/feedback-enrich

Troubleshooting

“Failed to fetch” in the UI

Backend not running or wrong port. Start FastAPI on :8000.

VITE_API_URL not set to the backend URL. Set it in frontend/.env.development.

CORS: ensure CORS_ORIGINS in backend/.env includes your Vite URL (http://localhost:5173).

Port already in use

Backend: run uvicorn app:app --reload --port 8001

Frontend: npm run dev -- --port 5174 and update VITE_API_URL if needed.

Reset the database

Stop the backend, delete backend/feedback.db, start backend again.

Scripts Reference

Backend

# from backend/
uvicorn app:app --reload --port 8000


Frontend

# from frontend/
npm run dev
npm run build
npm run preview

What’s Implemented

Submit feedback (name + message) and list all feedback.

Persistence via SQLite.

Clean UI with filtering by sentiment and text search.

Environment-driven configuration for frontend and backend.
