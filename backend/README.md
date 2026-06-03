# AI Smart Career Navigator v2.0 — Backend

A production-grade, highly scalable asynchronous FastAPI backend service utilizing MistralAI reasoning pipelines, local MS-MARCO Cross-Encoder reranking, layout-aware PDF extraction engines, and custom Data Structures & Algorithms (DSA).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following services installed and running locally:
* **Python 3.12 or 3.13**
* **MySQL 8.x** (typically run via XAMPP or native service)
* **Redis 7.x** (used as task broker, rate-limiter, and caching layer)

---

### 2. Setting Up the Virtual Environment

From the `backend/` directory, create and activate a Python virtual environment:

```bash
# Create Virtual Environment
python -m venv .venv

# Activate Virtual Environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activate Virtual Environment (Windows Command Prompt)
.venv\Scripts\activate

# Activate Virtual Environment (Linux / macOS)
source .venv/bin/activate
```

---

### 3. Installing Dependencies

Install all core full-stack dependencies pinned inside `requirements.txt`:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

### 4. Configuration Settings (`.env`)

Configure your environment settings. Duplicate or verify the `.env` file in the `backend/` directory:

```ini
APP_NAME="AI Smart Career Navigator"
APP_ENV="development"
DEBUG=true

# Security
SECRET_KEY="supersecretkeyforlocaldevelopmentcareerainavigator"
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Relational Database (MySQL)
DATABASE_URL="mysql+aiomysql://root:@localhost:3306/careerai"

# Task Broker & Cache (Redis)
REDIS_URL="redis://localhost:6379/0"

# MistralAI API Key
MISTRAL_API_KEY="your-mistral-api-key-here"

# Vector Persist Directory
CHROMA_PERSIST_DIR="../database/vector_data"
```

---

### 5. Database Initializations

Ensure your XAMPP/MySQL database server is running and a database named `careerai` is instantiated.
To verify migrations and bootstrap systems, you can execute the seeding scripts:

```bash
# Seed the core MySQL database schema and mock records
# (Ensure database/schema.sql is executed against your local mysql client)
```

---

### 6. Launching the Services

You must start both the async HTTP gateway and the background Celery workers.

#### **Start FastAPI Server (Gateway)**
Runs the ASGI web server with hot-reload enabled at `http://localhost:8000`:
```bash
uvicorn main:app --reload

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000


```

#### **Start Celery Worker (Async Task Engine)**
In a separate terminal (with the virtual environment activated), start the Celery async task queue:
```bash
celery -A app.tasks worker --loglevel=info
```

#### **Start Flower Dashboard (Celery Monitor - Optional)**
Monitors background worker pools at `http://localhost:5555`:
```bash
celery -A app.tasks flower
```

---

## 🛠️ Telemetry & System Verification

To run programmatic integration, import, and token-bucket rate limiter checks across the code:

```bash
# Run compiler checks
$env:PYTHONPATH="."; python scripts/test_endpoints.py

# Run standard telemetry diagnostics
python scripts/verify_system.py
```

All metrics, database models, and RAG pipelines are mapped directly inside the generated `checks.md` file upon test script execution.

---

## 🧩 Tech Stack Architecture

* **Core REST Gateway**: FastAPI + Uvicorn + Pydantic v2
* **Relational Core**: SQLAlchemy 2.0 (Async) + MySQL (XAMPP InnoDB)
* **Background Ingestions**: Celery + Redis
* **AI Cognitive Core**: MistralAI (SDK v1.x)
* **Local Neural Models**: `ms-marco-MiniLM-L-6-v2` cross-encoder rerankers, `all-MiniLM-L6-v2` embeddings, and `spaCy` NER
* **RAG Vector Engine**: ChromaDB persistent client + Okapi BM25 sparse search
* **PDF Parse Ingestions**: PyMuPDF + pdfplumber + Camelot



taskkill /F /IM python.exe /IM uvicorn.exe

netstat -ano | findstr 8000