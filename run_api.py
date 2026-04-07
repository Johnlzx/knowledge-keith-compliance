#!/usr/bin/env python3
"""Start the compliance RAG API server."""

import os

import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting MAS Compliance RAG API on http://0.0.0.0:{port}")
    print(f"Docs: http://0.0.0.0:{port}/docs")
    uvicorn.run("rag.api:app", host="0.0.0.0", port=port)
