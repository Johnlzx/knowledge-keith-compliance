# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Keith Compliance RAG is an AI-powered compliance agent for Singapore MAS financial regulations, targeting licensed fund management companies (LFMCs). It is a standalone project (not a submodule).

Two core use cases:
1. **Compliance Q&A Agent** (Phase 1) — precise regulatory answers with section-level citations
2. **Marketing Material Review Agent** (Phase 2) — auto-review fund factsheets against 20+ compliance rules, generating structured reports with Critical/Warning/Pass findings

The target client is RidgeField Capital (Singapore LFMC). Documentation is primarily in Chinese (Mandarin).

## Repository Structure

```
Keith-Compliance-RAG/
├── rag/                     # Python RAG backend (LangChain + FastAPI)
│   ├── config.py            #   Paths, models, chunk params
│   ├── ingest.py            #   PDF parsing → chunking → ChromaDB
│   ├── retriever.py         #   Vector similarity search
│   ├── chain.py             #   RAG chain (retrieve + Claude generation)
│   └── api.py               #   FastAPI REST endpoints
├── web/                     # Next.js 16 frontend
│   └── src/app/page.tsx     #   Unified Q&A + document review UI
├── data/
│   └── regulations/         # 23 source regulation PDFs (14 MB, ~1,800 pages)
├── scripts/
│   ├── ingest.py            # Ingest PDFs into vector database
│   └── serve.py             # Start API server
├── docs/                    # Documentation & analysis
│   ├── product_analysis.md
│   ├── business_overview.md
│   ├── keith_requirements_and_insights.md
│   ├── architecture_guide.md
│   ├── diagrams/            # PlantUML architecture diagrams
│   └── business/            # Client business documents
├── .chroma/                 # ChromaDB vector store (generated, gitignored)
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Regulatory Knowledge Architecture

Four pillars, by legal authority (highest to lowest):

| Pillar | Key Document | Legal Force |
|--------|-------------|-------------|
| **Statute** | SFA 2001 (Securities & Futures Act) | Highest — criminal liability |
| **MAS Code** | Code on CIS (Nov 2025 revision) | High — MAS enforcement |
| **MAS Guidelines** | FMC Guidelines, Liquidity Risk, CIS Practitioners Guide | Medium — expected compliance |
| **Industry Code** | IMAS Code of Best Practices | Low — best practice reference |

**Code on CIS is the single most important document** — it contains 80%+ of marketing material review rules.

## Technical Architecture

```
PDF → pdfplumber → RecursiveCharacterTextSplitter → ChromaDB (all-MiniLM-L6-v2)
Query → ChromaDB similarity search (k=6) → Claude API → Structured JSON response
```

- Chunking: 1,500 chars, 200 overlap
- Embedding: all-MiniLM-L6-v2 (local, 384-dim)
- LLM: Claude Sonnet via Anthropic API
- Vector DB: ChromaDB persisted to `.chroma/`
- Quality bar: >95% citation accuracy, <15s response time

## Key Commands

```bash
python scripts/ingest.py    # Ingest PDFs into vector DB
python scripts/serve.py     # Start API on :8000
cd web && pnpm dev          # Start frontend on :3000
```

## Key Documents for Context

- `docs/product_analysis.md` — POC strategy, 4 demo scenarios, pain point priority matrix
- `docs/keith_requirements_and_insights.md` — detailed RAG evaluation criteria and compliance workflow analysis
- `docs/business_overview.md` — RidgeField Capital operations, fund types, team structure
- `docs/architecture_guide.md` — RAG system architecture deep dive
