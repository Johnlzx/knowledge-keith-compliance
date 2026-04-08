# Keith Compliance RAG — MAS Fund Management Compliance Agent

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+ & pnpm
- Anthropic API Key

### 1. Set up environment

```bash
cd Keith-Compliance-RAG

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and fill in your ANTHROPIC_API_KEY
```

### 2. Ingest regulations into vector database

```bash
python scripts/ingest.py
```

Parses 23 regulation PDFs (~1,800 pages) into 3,400+ chunks in ChromaDB. Takes about 2 minutes.

### 3. Start the RAG API backend

```bash
python scripts/serve.py
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

### 4. Start the frontend

```bash
cd web
pnpm install
pnpm dev
# → http://localhost:3000
```

---

## Project Structure

```
Keith-Compliance-RAG/
├── rag/                     # Python RAG backend
│   ├── config.py            #   Configuration (paths, models, chunk params)
│   ├── ingest.py            #   PDF parsing → chunking → ChromaDB
│   ├── retriever.py         #   Vector similarity search
│   ├── chain.py             #   RAG chain (retrieve + Claude generation)
│   └── api.py               #   FastAPI REST endpoints
├── web/                     # Next.js frontend
│   └── src/app/page.tsx     #   Unified Q&A + document review UI
├── data/
│   └── regulations/         # Source regulation PDFs (23 files, 14 MB)
├── scripts/
│   ├── ingest.py            # Ingest PDFs into vector database
│   └── serve.py             # Start API server
├── docs/                    # Documentation & analysis
├── .chroma/                 # ChromaDB vector store (generated, gitignored)
├── Dockerfile
├── requirements.txt
└── .env.example
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/compliance/chat` | POST | Q&A — returns `ComplianceMessage` for frontend |
| `/api/compliance/ask` | POST | Q&A — returns raw JSON with answer + citations |
| `/api/compliance/sources` | GET | List knowledge base files and stats |

### Example

```bash
curl -X POST http://localhost:8000/api/compliance/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the minimum font size for CIS disclaimers?"}'
```

## Knowledge Base

| Pillar | Document | Legal Force |
|--------|----------|-------------|
| Statute | SFA 2001 | Criminal liability |
| MAS Code | Code on CIS (Nov 2025) | MAS enforcement |
| MAS Guidelines | FMC, Liquidity Risk, TRM, etc. | Expected compliance |
| Industry Code | IMAS Best Practices | Best practice |

Plus 19 supplementary MAS notices, guidelines, and FAQs.

## Tech Stack

- **Backend:** Python, LangChain, ChromaDB, Anthropic Claude API, FastAPI
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4
- **Embedding:** sentence-transformers (all-MiniLM-L6-v2, local)
