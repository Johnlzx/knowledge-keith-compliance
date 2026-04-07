FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and regulation PDFs
COPY rag/ rag/
COPY run_ingest.py run_api.py .env.example ./
COPY 01-Raw-Regulations/ 01-Raw-Regulations/

# Run ingestion at build time (bakes vector DB into image)
RUN python run_ingest.py

EXPOSE 8000

CMD ["python", "run_api.py"]
