# EchoBoard — Mini Feedback App (FastAPI + React/Vite)

A small full-stack application that lets users submit feedback and view all submissions.

- **Frontend:** React (Vite)  
- **Backend:** FastAPI  
- **Storage:** SQLite  

**Endpoints**

- `POST /api/feedback` — create `{ name, message }`  
- `GET  /api/feedback` — list all (newest first)

---

## Project Structure

```text
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
```

---

## Prerequisites

- Python **3.10+**  
- Node.js **18+** and npm  
- Git

---

## Quick Start

### 1) Clone

```bash
git clone https://github.com/Pramodhavg/echoboard
cd echoboard
```

### 2) Backend (FastAPI)

```bash
cd backend
python -m venv .venv
```

**Activate the virtual environment**

**Windows (PowerShell)**
```powershell
. .venv/Scripts/Activate.ps1
```

**macOS / Linux**
```bash
source .venv/bin/activate
```

**Install dependencies**
```bash
pip install -r requirements.txt
```

**Create your env file from the template**

**Windows**
```powershell
copy .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

**Run the API (docs at `/docs`)**
```bash
uvicorn app:app --reload --port 8000
```

**`backend/.env` contents reference**
```ini
# relative to backend/
DATABASE_PATH=feedback.db

# allow the Vite dev server to call the API
CORS_ORIGINS=http://localhost:5173

# leave empty to disable enrichment
N8N_WEBHOOK_URL=
```

### 3) Frontend (React/Vite)

```bash
cd ../frontend
npm install
```

**Set the API URL for Vite dev (optional but convenient)**

**Windows**
```powershell
echo VITE_API_URL=http://127.0.0.1:8000 > .env.development
```

**macOS / Linux**
```bash
printf "VITE_API_URL=http://127.0.0.1:8000\n" > .env.development
```

**Run the dev server**
```bash
npm run dev
```

Open the app at: `http://localhost:5173`

---

## Sample Requests

**Create feedback**
```bash
curl -X POST http://127.0.0.1:8000/api/feedback \
  -H "content-type: application/json" \
  -d '{"name":"Ava","message":"Great experience !!"}'
```

**List feedback**
```bash
curl http://127.0.0.1:8000/api/feedback
```

---

## Notes and Decisions

- Storage uses a local SQLite database at `backend/feedback.db` (created automatically).  
- UI shows badges for **positive**, **mixed**, and **negative**; **neutral** is intentionally hidden.  
- The label reads **“Summary:”**.  
- The app runs fully offline without any enrichment configured.

---

## Optional: Enable Enrichment with n8n

1) **Start n8n locally**
```bash
npx --yes n8n
```
Editor opens at `http://localhost:5678`.

2) **Import the workflow**
- Click **Import** in the editor and choose the file in the repo root:
  - `Feedback Enrich.json`
- Click **Activate**.

3) **Copy the Production Webhook URL** from the Webhook node  
   (looks like `http://localhost:5678/webhook/ai/feedback-enrich`).

4) **Put it in `backend/.env` and restart the API**
```ini
N8N_WEBHOOK_URL=http://127.0.0.1:5678/webhook/ai/feedback-enrich
```

---

## Troubleshooting

**“Failed to fetch” in the UI**
- Backend not running or wrong port. Start FastAPI on `:8000`.
- `VITE_API_URL` not set to the backend URL. Set it in `frontend/.env.development`.
- CORS: ensure `CORS_ORIGINS` in `backend/.env` includes your Vite URL (`http://localhost:5173`).

**Port already in use**
- Backend: run `uvicorn app:app --reload --port 8001`
- Frontend: `npm run dev -- --port 5174` and update `VITE_API_URL` if needed.

**Reset the database**
- Stop the backend, delete `backend/feedback.db`, start backend again.

---

## Scripts Reference

**Backend**
```bash
# from backend/
uvicorn app:app --reload --port 8000
```

**Frontend**
```bash
# from frontend/
npm run dev
npm run build
npm run preview
```

---

## What’s Implemented

- Submit feedback (name + message) and list all feedback.  
- Persistence via SQLite.  
- Clean UI with filtering by sentiment and text search.  
- Environment-driven configuration for frontend and backend.
