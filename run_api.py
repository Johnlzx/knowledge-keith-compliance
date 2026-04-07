#!/usr/bin/env python3
"""Start the compliance RAG API server."""

import uvicorn

if __name__ == "__main__":
    print("Starting MAS Compliance RAG API on http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    uvicorn.run("rag.api:app", host="0.0.0.0", port=8000, reload=True)
