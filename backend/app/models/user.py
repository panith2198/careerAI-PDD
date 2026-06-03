import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, DateTime, Boolean, Enum, ForeignKey, JSON, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    
    role: Mapped[str] = mapped_column(
        Enum("student", "mentor", "admin", name="user_role_enum"), 
        default="student", 
        nullable=False
    )
    subscription_tier: Mapped[str] = mapped_column(
        Enum("free", "pro", "enterprise", name="subscription_tier_enum"), 
        default="free", 
        nullable=False
    )
    mistral_token_budget: Mapped[int] = mapped_column(Integer, default=10000, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    last_login_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, 
        default=datetime.datetime.utcnow, 
        onupdate=datetime.datetime.utcnow, 
        nullable=False
    )

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile", 
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
    resumes: Mapped[List["Resume"]] = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    skills: Mapped[List["UserSkill"]] = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    assessment_results: Mapped[List["AssessmentResult"]] = relationship("AssessmentResult", back_populates="user", cascade="all, delete-orphan")
    roadmaps: Mapped[List["Roadmap"]] = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[List["JobApplication"]] = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    mentor_profile: Mapped[Optional["Mentor"]] = relationship("Mentor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recommendations: Mapped[List["CareerRecommendation"]] = relationship("CareerRecommendation", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    chat_sessions: Mapped[List["ChatSession"]] = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    profile_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    
    education_level: Mapped[str] = mapped_column(
        Enum("12th", "diploma", "btech", "mtech", "mba", "phd", name="education_level_enum"), 
        nullable=False
    )
    field_of_study: Mapped[str] = mapped_column(String(120), nullable=False)
    institution_name: Mapped[str] = mapped_column(String(255), nullable=False)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=False)
    
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    career_interests: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    preferred_work_mode: Mapped[Optional[str]] = mapped_column(
        Enum("remote", "onsite", "hybrid", name="work_mode_enum"), 
        nullable=True
    )
    expected_salary_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    resume_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    profile_embedding: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")


class Resume(Base):
    __tablename__ = "resumes"
    
    resume_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_kb: Mapped[int] = mapped_column(Integer, nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False)
    raw_text: Mapped[str] = mapped_column(String, nullable=False)
    structured_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    skills_extracted: Mapped[dict] = mapped_column(JSON, nullable=False)
    ats_score: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2), nullable=True)
    parser_version: Mapped[str] = mapped_column(String(20), nullable=False)
    chroma_doc_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    parse_status: Mapped[str] = mapped_column(
        Enum("pending", "processing", "done", "failed", name="parse_status_enum"), 
        default="pending", 
        nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    parsed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="resumes")
