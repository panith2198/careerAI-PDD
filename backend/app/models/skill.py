import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, DateTime, Boolean, Enum, ForeignKey, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Skill(Base):
    __tablename__ = "skills"
    
    skill_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    skill_slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(
        Enum("technical", "soft", "domain", "tool", name="skill_category_enum"), 
        nullable=False
    )
    domain: Mapped[str] = mapped_column(String(80), nullable=False)
    market_demand_score: Mapped[float] = mapped_column(DECIMAL(5, 2), default=0.00, nullable=False)
    avg_salary_impact_pct: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2), nullable=True)
    is_trending: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    parent_skill_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("skills.skill_id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user_skills: Mapped[List["UserSkill"]] = relationship("UserSkill", back_populates="skill")
    career_skills: Mapped[List["CareerSkill"]] = relationship("CareerSkill", back_populates="skill")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"
    
    user_skill_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False)
    
    proficiency_level: Mapped[str] = mapped_column(
        Enum("beginner", "intermediate", "advanced", "expert", name="proficiency_level_enum"), 
        nullable=False
    )
    proficiency_score: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2), nullable=True)
    years_of_experience: Mapped[float] = mapped_column(DECIMAL(3, 1), default=0.0, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    endorsed_by_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    source: Mapped[str] = mapped_column(
        Enum("self", "assessment", "ai", "resume", "mentor", name="skill_source_enum"), 
        default="self", 
        nullable=False
    )
    added_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="user_skills")
