"""SQLite persistence for conversation sessions and messages."""

from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Optional

from rag.config import DB_DIR, DB_PATH

_CREATE_SQL = """
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'qa',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
"""


def _connect() -> sqlite3.Connection:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    with _connect() as conn:
        conn.executescript(_CREATE_SQL)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Conversations ───────────────────────────────────────────────────

def create_conversation(title: str, conv_type: str = "qa") -> dict:
    conv_id = str(uuid.uuid4())
    now = _now()
    with _connect() as conn:
        conn.execute(
            "INSERT INTO conversations (id, title, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (conv_id, title, conv_type, now, now),
        )
    return {"id": conv_id, "title": title, "type": conv_type, "created_at": now, "updated_at": now}


def list_conversations() -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT c.*, COUNT(m.id) as message_count "
            "FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id "
            "GROUP BY c.id ORDER BY c.updated_at DESC"
        ).fetchall()
    return [
        {
            "id": r["id"], "title": r["title"], "type": r["type"],
            "created_at": r["created_at"], "updated_at": r["updated_at"],
            "message_count": r["message_count"],
        }
        for r in rows
    ]


def get_conversation(conv_id: str) -> Optional[dict]:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,)).fetchone()
        if not row:
            return None
        msgs = conn.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at", (conv_id,)
        ).fetchall()
    return {
        "id": row["id"], "title": row["title"], "type": row["type"],
        "created_at": row["created_at"], "updated_at": row["updated_at"],
        "messages": [
            {"id": m["id"], "role": m["role"], "content": json.loads(m["content"]), "created_at": m["created_at"]}
            for m in msgs
        ],
    }


def delete_conversation(conv_id: str) -> bool:
    with _connect() as conn:
        cur = conn.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
    return cur.rowcount > 0


def update_conversation_title(conv_id: str, title: str):
    with _connect() as conn:
        conn.execute("UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?", (title, _now(), conv_id))


# ── Messages ────────────────────────────────────────────────────────

def add_message(conv_id: str, role: str, content: dict) -> dict:
    msg_id = str(uuid.uuid4())
    now = _now()
    with _connect() as conn:
        conn.execute(
            "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
            (msg_id, conv_id, role, json.dumps(content, ensure_ascii=False), now),
        )
        conn.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conv_id))
    return {"id": msg_id, "role": role, "content": content, "created_at": now}


def get_history_for_llm(conv_id: str, max_turns: int = 10) -> list[dict]:
    """Get recent conversation history formatted for the LLM (text-only summaries)."""
    with _connect() as conn:
        rows = conn.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at",
            (conv_id,),
        ).fetchall()

    history = []
    for r in rows:
        blocks = json.loads(r["content"]) if isinstance(r["content"], str) else r["content"]
        # Extract only text content from blocks to keep token usage low
        if r["role"] == "user":
            text_parts = [b.get("content", "") for b in blocks if b.get("type") == "text" and b.get("content")]
            if text_parts:
                history.append({"role": "user", "content": " ".join(text_parts)})
        else:
            text_parts = [b.get("content", "") for b in blocks if b.get("type") in ("text", "heading") and b.get("content")]
            if text_parts:
                history.append({"role": "ai", "content": " ".join(text_parts)})

    # Keep only last N turns (each turn = user + ai pair)
    if len(history) > max_turns * 2:
        history = history[-(max_turns * 2):]

    return history


# Initialize tables on import
init_db()
