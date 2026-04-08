import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_REGULATIONS_DIR = BASE_DIR / "data" / "regulations"
CHROMA_PERSIST_DIR = BASE_DIR / ".chroma"

# Chunking
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200

# Retrieval
RETRIEVAL_TOP_K = 6

# Embedding model (local, no API key needed)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# LLM
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_BASE_URL = os.getenv("ANTHROPIC_BASE_URL", None)
LLM_MODEL = "claude-sonnet-4-20250514"
LLM_MAX_TOKENS = 4096

# ChromaDB collection name
COLLECTION_NAME = "mas_regulations"
