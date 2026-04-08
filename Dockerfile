FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and regulation PDFs
COPY rag/ rag/
COPY scripts/ scripts/
COPY .env.example ./
COPY data/regulations/ data/regulations/

# Run ingestion at build time (bakes vector DB into image)
RUN python scripts/ingest.py

# Ensure persistent data directory exists
RUN mkdir -p .data

EXPOSE 8000

CMD ["python", "scripts/serve.py"]
