import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, DateTime, Boolean, Enum, ForeignKey, JSON, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Career(Base):
    __tablename__ = "careers"
    
    career_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    
    avg_salary_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    avg_salary_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    growth_rate_pct: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2), nullable=True)
    demand_score: Mapped[float] = mapped_column(DECIMAL(5, 2), default=0.00, nullable=False)
    
    difficulty_level: Mapped[str] = mapped_column(
        Enum("easy", "medium", "hard", "expert", name="difficulty_level_enum"), 
        nullable=False
    )
    time_to_job_ready_months: Mapped[int] = mapped_column(Integer, nullable=False)
    embedding_vector: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    career_skills: Mapped[List["CareerSkill"]] = relationship("CareerSkill", back_populates="career", cascade="all, delete-orphan")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="career")
    roadmaps: Mapped[List["Roadmap"]] = relationship("Roadmap", back_populates="career", cascade="all, delete-orphan")
    jobs: Mapped[List["Job"]] = relationship("Job", back_populates="career")
    recommendations: Mapped[List["CareerRecommendation"]] = relationship("CareerRecommendation", back_populates="career", cascade="all, delete-orphan")


class CareerSkill(Base):
    __tablename__ = "career_skills"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    career_id: Mapped[int] = mapped_column(Integer, ForeignKey("careers.career_id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False)
    
    importance: Mapped[str] = mapped_column(
        Enum("must_have", "good_to_have", "optional", name="importance_enum"), 
        nullable=False
    )
    min_proficiency: Mapped[str] = mapped_column(
        Enum("beginner", "intermediate", "advanced", "expert", name="min_proficiency_enum"), 
        nullable=False
    )
    weightage: Mapped[float] = mapped_column(DECIMAL(4, 2), default=1.00, nullable=False)

    # Relationships
    career: Mapped["Career"] = relationship("Career", back_populates="career_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="career_skills")


class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"
    
    rec_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    career_id: Mapped[int] = mapped_column(Integer, ForeignKey("careers.career_id", ondelete="CASCADE"), nullable=False)
    
    fit_score: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_model: Mapped[str] = mapped_column(String(50), nullable=False)
    reasoning_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    gap_skills_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    trigger: Mapped[str] = mapped_column(
        Enum("onboarding", "profile_update", "manual", "scheduled", name="recommendation_trigger_enum"), 
        nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="recommendations")
    career: Mapped["Career"] = relationship("Career", back_populates="recommendations")
