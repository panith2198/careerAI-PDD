import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, DateTime, Boolean, Enum, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Job(Base):
    __tablename__ = "jobs"
    
    job_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    job_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    job_url_direct: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    company_url: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    company_logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    career_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("careers.career_id", ondelete="SET NULL"), nullable=True)
    
    description_raw: Mapped[str] = mapped_column(String, nullable=False)
    required_skills_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    location_city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    work_mode: Mapped[str] = mapped_column(
        Enum("remote", "onsite", "hybrid", name="job_work_mode_enum"), 
        nullable=False
    )
    job_type: Mapped[Optional[str]] = mapped_column(
        Enum("fulltime", "parttime", "internship", "contract", name="job_type_enum"),
        nullable=True
    )
    experience_min_months: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    salary_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(String(10), default="INR", nullable=True)
    
    source: Mapped[str] = mapped_column(
        Enum("linkedin", "naukri", "indeed", "zip_recruiter", "google", "glassdoor", "internal", "manual", name="job_source_enum"), 
        nullable=False
    )
    is_fresher_eligible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    posting_date: Mapped[datetime.date] = mapped_column(nullable=False)
    expiry_date: Mapped[Optional[datetime.date]] = mapped_column(nullable=True)
    embedding_vector: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    career: Mapped[Optional["Career"]] = relationship("Career", back_populates="jobs")
    applications: Mapped[List["JobApplication"]] = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")


class RagDocument(Base):
    __tablename__ = "rag_documents"
    
    doc_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    collection_name: Mapped[str] = mapped_column(String(100), nullable=False)
    source_type: Mapped[str] = mapped_column(
        Enum("pdf", "url", "docx", "txt", "manual", name="source_type_enum"), 
        nullable=False
    )
    source_path: Mapped[str] = mapped_column(String(500), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(String, nullable=False)
    chroma_doc_id: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    embedding_model: Mapped[str] = mapped_column(String(100), nullable=False)
    embedding_dim: Mapped[int] = mapped_column(Integer, nullable=False)
    token_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    msmarco_relevance_cache: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        onupdate=datetime.datetime.utcnow, 
        nullable=False
    )
