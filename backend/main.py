import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from app.core.config import settings
from app.core.database import get_db, engine

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up CareerAI Backend Service...")
    logger.info(f"Checking connection to database at: {settings.DATABASE_URL.split('@')[-1]}")
    
    try:
        # Validate connection to the MySQL database
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            if result.scalar() == 1:
                logger.info("Database connectivity check: OK")
            else:
                logger.warning("Database connectivity check: Unexpected result scalar")
    except Exception as e:
        logger.critical(f"Database connectivity check failed: {e}")
        logger.critical("Check if MySQL (XAMPP) is running and the 'careerai' database exists.")
        
    yield
    logger.info("Shutting down CareerAI Backend Service...")

from fastapi.staticfiles import StaticFiles
import os

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    description="Scalable FastAPI microservice platform using MistralAI reasoning and hybrid RAG search logic.",
    version="2.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Ensure storage directories exist
os.makedirs("storage/user_uploads", exist_ok=True)
os.makedirs("storage/resumes", exist_ok=True)
os.makedirs("storage/kb", exist_ok=True)

# Mount static storage
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# CORS Policies
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers Inclusions
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.career import router as career_router
from app.api.v1.assessment import router as assessment_router
from app.api.v1.roadmap import router as roadmap_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.rag import router as rag_router
from app.api.v1.resume import router as resume_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.websocket import router as ws_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["User Profiles"])
app.include_router(career_router, prefix="/api/v1/careers", tags=["Careers"])
app.include_router(career_router, prefix="/api/v1/career", tags=["Careers"])
app.include_router(assessment_router, prefix="/api/v1/assessments", tags=["Assessments"])
app.include_router(assessment_router, prefix="/api/v1/assessment", tags=["Assessments"])
app.include_router(roadmap_router, prefix="/api/v1/roadmaps", tags=["Learning Roadmaps"])
app.include_router(roadmap_router, prefix="/api/v1/roadmap", tags=["Learning Roadmaps"])
app.include_router(jobs_router, prefix="/api/v1/jobs", tags=["Jobs Matching"])
app.include_router(rag_router, prefix="/api/v1/rag", tags=["Knowledge RAG Query"])
app.include_router(resume_router, prefix="/api/v1/resumes", tags=["Resumes ATS Ingestion"])
app.include_router(resume_router, prefix="/api/v1/resume", tags=["Resumes ATS Ingestion"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Dashboard Analytics"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(ws_router, tags=["WebSockets Real-time"])


# Health Status Endpoint
@app.get("/health", tags=["Status"])
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        res = await db.execute(text("SELECT 1"))
        db_alive = res.scalar() == 1
    except Exception as e:
        logger.error(f"Health check database failure: {e}")
        db_alive = False
        
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": "connected" if db_alive else "disconnected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
