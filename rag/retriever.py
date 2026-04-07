"""Retrieval layer: load ChromaDB and search for relevant regulation chunks."""

from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from rag.config import (
    CHROMA_PERSIST_DIR,
    COLLECTION_NAME,
    EMBEDDING_MODEL,
    RETRIEVAL_TOP_K,
)


def get_vectorstore() -> Chroma:
    """Load persisted ChromaDB vector store."""
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    return Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=str(CHROMA_PERSIST_DIR),
        embedding_function=embeddings,
    )


def retrieve(query: str, top_k: int = RETRIEVAL_TOP_K) -> list[dict]:
    """Search vector store and return relevant chunks with metadata."""
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search_with_score(query, k=top_k)

    retrieved = []
    for doc, score in results:
        retrieved.append(
            {
                "text": doc.page_content,
                "source": doc.metadata.get("source", "Unknown"),
                "filename": doc.metadata.get("filename", ""),
                "page": doc.metadata.get("page", 0),
                "score": round(float(score), 4),
            }
        )
    return retrieved
