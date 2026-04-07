"""PDF ingestion pipeline: parse → chunk → embed → store in ChromaDB."""

import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from rag.config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    CHROMA_PERSIST_DIR,
    COLLECTION_NAME,
    EMBEDDING_MODEL,
    RAW_REGULATIONS_DIR,
)

# Friendly names for source files
SOURCE_NAMES = {
    "Code_on_CIS_Nov2025.pdf": "Code on CIS (Nov 2025)",
    "SFA_2001_Full.pdf": "Securities and Futures Act 2001",
    "SFA_CIS_Regulations_S602.pdf": "SFA CIS Regulations (S602)",
    "MAS_Notice_SFA04_N02_AML_CFT.pdf": "MAS Notice SFA 04-N02 (AML/CFT)",
    "MAS_Guidelines_SFA04_N02_AML_CFT.pdf": "Guidelines to MAS Notice SFA 04-N02",
    "MAS_Guidelines_FMC_SFA04G05.pdf": "MAS Guidelines SFA 04-G05 (FMC)",
    "MAS_Liquidity_Risk_FMC_SFA04G08.pdf": "MAS Guidelines SFA 04-G08 (Liquidity Risk)",
    "MAS_Notice_FSM_N21_Technology_Risk.pdf": "MAS Notice FSM-N21 (Technology Risk)",
    "MAS_TRM_Guidelines.pdf": "MAS TRM Guidelines",
    "MAS_BCM_Guidelines_Jun2022.pdf": "MAS BCM Guidelines (Jun 2022)",
    "MAS_Environmental_Risk_Asset_Managers.pdf": "MAS Environmental Risk Guidelines (Asset Managers)",
    "MAS_Individual_Accountability_Conduct.pdf": "MAS IAC Guidelines",
    "MAS_Fair_Dealing_Guidelines_May2024.pdf": "MAS Fair Dealing Guidelines (May 2024)",
    "MAS_Guidelines_Outsourcing_FI.pdf": "MAS Outsourcing Guidelines (FI)",
    "MAS_CIS_Practitioners_Guide.pdf": "MAS CIS Practitioner's Guide",
    "IMAS_Code_Best_Practices_Advertising_CIS_ILP.pdf": "IMAS Code of Best Practices (Advertising CIS/ILP)",
    "IMAS_Code_of_Ethics_2010.pdf": "IMAS Code of Ethics",
}


def get_source_name(filename: str) -> str:
    return SOURCE_NAMES.get(filename, filename.replace(".pdf", "").replace("_", " "))


def extract_text_from_pdf(pdf_path) -> list[dict]:
    """Extract text from PDF, returning list of {text, page, source}."""
    docs = []
    filename = pdf_path.name
    source_name = get_source_name(filename)

    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and text.strip():
                docs.append(
                    {
                        "text": text.strip(),
                        "metadata": {
                            "source": source_name,
                            "filename": filename,
                            "page": i + 1,
                            "total_pages": len(pdf.pages),
                        },
                    }
                )
    return docs


def chunk_documents(docs: list[dict]) -> list:
    """Split documents into chunks with metadata preserved."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = []
    for doc in docs:
        splits = splitter.split_text(doc["text"])
        for j, chunk_text in enumerate(splits):
            chunks.append(
                {
                    "text": chunk_text,
                    "metadata": {
                        **doc["metadata"],
                        "chunk_index": j,
                    },
                }
            )
    return chunks


def build_vectorstore(chunks: list) -> Chroma:
    """Create ChromaDB vectorstore from chunks."""
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    vectorstore = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=str(CHROMA_PERSIST_DIR),
    )
    return vectorstore


def ingest_all(pdf_dir=None) -> dict:
    """Full pipeline: parse all PDFs → chunk → store. Returns stats."""
    pdf_dir = pdf_dir or RAW_REGULATIONS_DIR
    pdf_files = sorted(pdf_dir.glob("*.pdf"))

    print(f"Found {len(pdf_files)} PDF files in {pdf_dir}")

    all_docs = []
    for pdf_path in pdf_files:
        print(f"  Parsing: {pdf_path.name}...", end=" ")
        docs = extract_text_from_pdf(pdf_path)
        print(f"{len(docs)} pages")
        all_docs.extend(docs)

    print(f"\nTotal pages extracted: {len(all_docs)}")

    print("Chunking documents...")
    chunks = chunk_documents(all_docs)
    print(f"Total chunks: {len(chunks)}")

    print("Building vector store (this may take a few minutes)...")
    CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
    vectorstore = build_vectorstore(chunks)

    stats = {
        "files": len(pdf_files),
        "pages": len(all_docs),
        "chunks": len(chunks),
        "persist_dir": str(CHROMA_PERSIST_DIR),
    }
    print(f"\nDone! Vector store saved to {CHROMA_PERSIST_DIR}")
    print(f"Stats: {stats}")
    return stats
