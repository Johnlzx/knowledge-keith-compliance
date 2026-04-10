"""FastAPI service for compliance Q&A."""

from __future__ import annotations

import os
import uuid
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag.chain import ask
from rag.config import ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL, CHROMA_PERSIST_DIR, RAW_REGULATIONS_DIR
from rag.retriever import get_vectorstore
from rag.review import extract_pdf, review_document
from rag import database as db

# Startup diagnostics
print(f"[DIAG] ANTHROPIC_API_KEY set: {bool(ANTHROPIC_API_KEY)} (len={len(ANTHROPIC_API_KEY)})")
print(f"[DIAG] ANTHROPIC_BASE_URL: {ANTHROPIC_BASE_URL}")
print(f"[DIAG] os.environ ANTHROPIC_API_KEY: {bool(os.environ.get('ANTHROPIC_API_KEY'))}")

app = FastAPI(
    title="MAS Compliance RAG API",
    description="Regulatory compliance Q&A powered by RAG + Claude",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None


class CreateConversationRequest(BaseModel):
    title: str = "New Q&A"
    type: str = "qa"


class Citation(BaseModel):
    source: str
    page: int
    excerpt: str


class RetrievedSource(BaseModel):
    source: str
    page: int
    score: float


class AnswerResponse(BaseModel):
    answer: str
    citations: list[Citation]
    confidence: str
    retrieved_sources: list[RetrievedSource]


class SourceInfo(BaseModel):
    filename: str
    source_name: str


@app.get("/api/health")
def health():
    db_exists = CHROMA_PERSIST_DIR.exists()
    return {"status": "ok", "vector_db_ready": db_exists}


@app.post("/api/compliance/ask", response_model=AnswerResponse)
def compliance_ask(req: QuestionRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not CHROMA_PERSIST_DIR.exists():
        raise HTTPException(
            status_code=503,
            detail="Vector database not initialized. Run `python run_ingest.py` first.",
        )

    result = ask(req.question)
    return result


@app.post("/api/compliance/chat")
def compliance_chat(req: QuestionRequest):
    """Return answer in ComplianceMessage format for the frontend UI."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not CHROMA_PERSIST_DIR.exists():
        raise HTTPException(
            status_code=503,
            detail="Vector database not initialized. Run `python run_ingest.py` first.",
        )

    # Load conversation history if conversation_id is provided
    history = None
    if req.conversation_id:
        history = db.get_history_for_llm(req.conversation_id)
        # Persist the user message
        db.add_message(req.conversation_id, "user", [{"type": "text", "content": req.question}])
    result = ask(req.question, conversation_history=history)

    # Build thinking steps from retrieved sources
    thinking_steps = []
    seen_sources = set()
    for src in result.get("retrieved_sources", []):
        source_name = src["source"]
        if source_name not in seen_sources:
            seen_sources.add(source_name)
            thinking_steps.append(
                {"icon": "search", "text": f"Searched {source_name} (Page {src['page']})"}
            )
    thinking_steps.append(
        {"icon": "analyze", "text": "Cross-referencing regulatory provisions to compile answer"}
    )

    # Build blocks matching frontend ComplianceMessageBlock type
    blocks = []

    # Thinking block
    blocks.append({
        "type": "thinking",
        "thinking": {
            "title": "Analyzing regulatory requirements",
            "description": f"Searching across {len(seen_sources)} regulatory sources to find the most relevant provisions.",
            "steps": thinking_steps,
        },
    })

    # Main answer text
    blocks.append({"type": "text", "content": result.get("answer", "")})

    # Citations
    for cit in result.get("citations", []):
        blocks.append({
            "type": "citation",
            "citation": {
                "text": cit.get("excerpt", ""),
                "source": f"{cit.get('source', '')}, Page {cit.get('page', '')}",
            },
        })

    # Status
    confidence = result.get("confidence", "medium")
    blocks.append({"type": "status", "content": f"Completed (confidence: {confidence})"})

    # Build follow-up suggestions (from Claude or fallback)
    raw_follow_ups = result.get("follow_ups", [])
    if raw_follow_ups:
        follow_ups = [{"text": f} for f in raw_follow_ups[:3]]
    else:
        follow_ups = [
            {"text": "Can you explain this in more detail?"},
            {"text": "What are the penalties for non-compliance?"},
            {"text": "Are there any exemptions that might apply?"},
        ]

    message = {
        "id": str(uuid.uuid4()),
        "role": "ai",
        "blocks": blocks,
        "showStatus": True,
        "suggestedFollowUps": follow_ups,
    }

    # Persist AI response
    if req.conversation_id:
        db.add_message(req.conversation_id, "ai", blocks)

    return message


# ── Conversation CRUD ────────────────────────────────────────────────

@app.post("/api/conversations")
def create_conversation(req: CreateConversationRequest):
    return db.create_conversation(req.title, req.type)


@app.get("/api/conversations")
def list_conversations():
    return db.list_conversations()


@app.get("/api/conversations/{conv_id}")
def get_conversation(conv_id: str):
    conv = db.get_conversation(conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@app.delete("/api/conversations/{conv_id}")
def delete_conversation(conv_id: str):
    if not db.delete_conversation(conv_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}


# ── Document Review ──────────────────────────────────────────────────

@app.post("/api/compliance/review")
async def compliance_review(
    file: UploadFile = File(...),
    conversation_id: Optional[str] = Form(None),
):
    """Upload a PDF and run compliance review against MAS regulations."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    if not CHROMA_PERSIST_DIR.exists():
        raise HTTPException(status_code=503, detail="Vector database not initialized.")

    file_bytes = await file.read()
    file_size = len(file_bytes)

    # Extract text from PDF
    doc = extract_pdf(file_bytes)

    # Load conversation history if available
    history = None
    if conversation_id:
        history = db.get_history_for_llm(conversation_id)
        # Persist user upload message
        db.add_message(conversation_id, "user", [{
            "type": "attachment",
            "attachment": {
                "filename": file.filename,
                "filesize": f"{file_size / 1024:.0f} KB",
                "filetype": "pdf",
                "status": "uploaded",
            },
        }])

    # Run review
    result = review_document(doc["full_text"], doc["page_count"], conversation_history=history)

    # Count retrieved sources
    seen_sources = set()
    for src in result.get("retrieved_sources", []):
        seen_sources.add(src["source"])

    # Count findings by severity
    findings = result.get("findings", [])
    n_critical = sum(1 for f in findings if f.get("severity") == "critical")
    n_warning = sum(1 for f in findings if f.get("severity") == "warning")
    n_pass = sum(1 for f in findings if f.get("severity") == "pass")

    # Build blocks
    blocks = []

    # Generic report progress — reusable across every case
    blocks.append({
        "type": "report-progress",
        "reportProgress": {
            "title": "Compliance Review Pipeline",
            "steps": [
                {"label": "Parsing document structure", "status": "done", "detail": f"{doc['page_count']} pages"},
                {"label": "Retrieving applicable regulations", "status": "done", "detail": f"{len(seen_sources)} sources"},
                {"label": "Analyzing compliance dimensions", "status": "done", "detail": "9 dimensions"},
                {"label": "Compiling findings and recommendations", "status": "done", "detail": f"{n_critical + n_warning + n_pass} items"},
                {"label": "Finalizing compliance report", "status": "done"},
            ],
        },
    })

    # Summary
    summary = result.get("summary", "Review completed.")
    blocks.append({"type": "text", "content": summary})

    # Findings heading
    if findings:
        blocks.append({"type": "heading", "content": "Compliance Findings", "level": 2})
        blocks.append({"type": "findings", "findings": findings})

    # Citations
    citations = result.get("citations", [])
    if citations:
        blocks.append({"type": "heading", "content": "Regulatory References", "level": 2})
        for cit in citations[:6]:
            blocks.append({
                "type": "citation",
                "citation": {"text": cit.get("text", ""), "source": cit.get("source", "")},
            })

    # Checklist
    checklist = result.get("checklist", [])
    if checklist:
        blocks.append({"type": "heading", "content": "Compliance Checklist", "level": 2})
        blocks.append({"type": "checklist", "checklist": checklist})

    # Status
    blocks.append({"type": "status", "content": f"Review completed — {n_critical} critical, {n_warning} warnings, {n_pass} pass"})

    follow_ups = [
        {"text": "Which critical findings should we prioritize fixing first?"},
        {"text": "Can you explain the MAS disclaimer requirement in more detail?"},
        {"text": "What are the penalties for these compliance violations?"},
    ]

    message = {
        "id": str(uuid.uuid4()),
        "role": "ai",
        "blocks": blocks,
        "showStatus": True,
        "suggestedFollowUps": follow_ups,
    }

    # Persist AI response
    if conversation_id:
        db.add_message(conversation_id, "ai", blocks)

    return message


@app.get("/api/compliance/sources")
def list_sources():
    pdf_files = sorted(RAW_REGULATIONS_DIR.glob("*.pdf"))
    sources = []
    for f in pdf_files:
        sources.append({"filename": f.name, "size_kb": f.stat().st_size // 1024})

    # Get vector store stats
    try:
        vs = get_vectorstore()
        collection = vs._collection
        chunk_count = collection.count()
    except Exception:
        chunk_count = 0

    return {
        "regulation_files": len(sources),
        "total_chunks": chunk_count,
        "sources": sources,
    }
