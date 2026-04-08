#!/usr/bin/env python3
"""Ingest all regulation PDFs into ChromaDB vector store."""

from rag.ingest import ingest_all

if __name__ == "__main__":
    print("=" * 60)
    print("  MAS Compliance RAG - Document Ingestion")
    print("=" * 60)
    print()

    stats = ingest_all()

    print()
    print("=" * 60)
    print(f"  Ingestion complete!")
    print(f"  Files processed: {stats['files']}")
    print(f"  Pages extracted: {stats['pages']}")
    print(f"  Chunks created:  {stats['chunks']}")
    print(f"  Vector DB:       {stats['persist_dir']}")
    print("=" * 60)
