# Keith Compliance RAG — MAS Fund Management Compliance Agent

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+ & pnpm
- Anthropic API Key

### 1. Set up environment

```bash
# Clone and enter project
cd Keith-Compliance-RAG

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env with your API key
cp .env.example .env
# Edit .env and fill in your ANTHROPIC_API_KEY
```

### 2. Ingest regulations into vector database

```bash
python run_ingest.py
```

This parses 23 regulation PDFs (14MB, ~1,800 pages) → 3,400+ chunks → ChromaDB vector store.
Takes about 2 minutes on first run.

### 3. Start the RAG API backend

```bash
python run_api.py
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

### 4. Start the frontend

```bash
cd demo
pnpm install
pnpm dev
# → http://localhost:3000/fund-compliance
```

Open http://localhost:3000/fund-compliance in your browser. Type a compliance question and the system will search regulations and generate an answer with citations.

---

## Project Structure

```
Keith-Compliance-RAG/
├── rag/                        # Python RAG backend
│   ├── config.py               #   Configuration (paths, model, chunk params)
│   ├── ingest.py               #   PDF parsing → chunking → ChromaDB
│   ├── retriever.py            #   Vector similarity search
│   ├── chain.py                #   RAG chain (retrieve + Claude generation)
│   └── api.py                  #   FastAPI REST endpoints
│
├── demo/                       # Next.js frontend
│   └── src/app/page.tsx        #   Main compliance chat UI
│
├── 01-Raw-Regulations/         # Source regulation PDFs (23 files, 14MB)
├── 02-Processed/               # ChromaDB vector database (generated)
├── docs/                       # Documentation & analysis
│
├── run_ingest.py               # One-command ingestion script
├── run_api.py                  # Start API server
├── requirements.txt            # Python dependencies
└── .env.example                # Environment variable template
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

## Knowledge Base (4 Regulatory Pillars)

| Pillar | Document | Status |
|--------|----------|--------|
| SFA (Offers of Investment) | `SFA_2001_Full.pdf` | ✅ |
| Code on CIS (Nov 2025) | `Code_on_CIS_Nov2025.pdf` | ✅ |
| IMAS Code of Best Practices | `IMAS_Code_Best_Practices_Advertising_CIS_ILP.pdf` | ✅ |
| MAS Pointers on CIS | Multiple FAQ + guideline files | ✅ |

Plus 19 supplementary MAS notices, guidelines, and FAQs covering AML/CFT, technology risk, outsourcing, fair dealing, environmental risk, and more.

## Tech Stack

- **Backend:** Python, LangChain, ChromaDB, Anthropic Claude API, FastAPI
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4
- **Embedding:** sentence-transformers (all-MiniLM-L6-v2, local)
