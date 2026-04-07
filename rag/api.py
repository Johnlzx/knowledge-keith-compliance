"""FastAPI service for compliance Q&A."""

import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os

from rag.chain import ask
from rag.config import ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL, CHROMA_PERSIST_DIR, RAW_REGULATIONS_DIR
from rag.retriever import get_vectorstore

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

    result = ask(req.question)

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
