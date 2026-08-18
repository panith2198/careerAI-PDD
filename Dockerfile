FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        gcc \
        libglib2.0-0 \
        libgomp1 \
        pkg-config \
        poppler-utils \
        tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY backend/ .
COPY database/schema.sql database/schema.sql

RUN mkdir -p storage/user_uploads storage/resumes storage/kb vector_data models_cache knowledge_base

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
