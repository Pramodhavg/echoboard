from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import sqlite3, os, datetime as dt, json
import httpx
from dotenv import load_dotenv

# ----- env -----
load_dotenv()
DB_PATH = os.getenv("DATABASE_PATH", "feedback.db")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "").strip()

# ----- app & CORS -----
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- DB helpers -----
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL,
          sentiment TEXT,
          summary TEXT
        )
        """)

def insert_feedback(name: str, message: str) -> int:
    with get_conn() as c:
        now = dt.datetime.utcnow().isoformat() + "Z"
        cur = c.execute(
            "INSERT INTO feedback(name, message, created_at) VALUES(?,?,?)",
            (name, message, now),
        )
        return cur.lastrowid

def list_feedback() -> List[dict]:
    with get_conn() as c:
        rows = c.execute(
            "SELECT id, name, message, created_at, sentiment, summary "
            "FROM feedback ORDER BY created_at DESC, id DESC"
        ).fetchall()
        return [dict(r) for r in rows]

def update_enrichment(fid: int, sentiment: Optional[str], summary: Optional[str]):
    with get_conn() as c:
        c.execute(
            "UPDATE feedback SET sentiment=?, summary=? WHERE id=?",
            (sentiment, summary, fid),
        )

# ----- n8n call -----
async def call_n8n_and_update(fid: int, name: str, message: str):
    if not N8N_WEBHOOK_URL:
        return
    payload = {"id": fid, "name": name, "message": message}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(N8N_WEBHOOK_URL, json=payload)
            r.raise_for_status()
            try:
                data = r.json()
            except Exception:
                try:
                    data = json.loads(r.text)
                except Exception:
                    data = {}
        sentiment = (data.get("sentiment") or "").strip() or None
        summary = (data.get("summary") or "").strip() or None
        update_enrichment(fid, sentiment, summary)
    except Exception as e:
        print("n8n enrichment failed:", e)

# ----- models -----
class FeedbackIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    message: str = Field(min_length=1, max_length=500)

# ----- routes -----
@app.get("/ping")
def ping(): return {"ok": True}

@app.get("/api/feedback")
def get_feedback():
    return list_feedback()

@app.post("/api/feedback")
async def create_feedback(body: FeedbackIn, tasks: BackgroundTasks):
    fid = insert_feedback(body.name.strip(), body.message.strip())
    # kick off enrichment in the background
    tasks.add_task(call_n8n_and_update, fid, body.name.strip(), body.message.strip())
    # return the inserted item so the UI shows it immediately
    items = list_feedback()
    item = next((i for i in items if i["id"] == fid), None)
    if not item:
        raise HTTPException(status_code=500, detail="Insert succeeded but read-back failed.")
    return item

# init DB on import
init_db()