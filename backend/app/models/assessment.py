import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, DateTime, Boolean, Enum, ForeignKey, JSON, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Assessment(Base):
    __tablename__ = "assessments"
    
    assessment_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    career_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("careers.career_id", ondelete="SET NULL"), nullable=True)
    skill_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("skills.skill_id", ondelete="SET NULL"), nullable=True)
    
    type: Mapped[str] = mapped_column(
        Enum("mcq", "coding", "scenario", "video", name="assessment_type_enum"), 
        nullable=False
    )
    difficulty: Mapped[str] = mapped_column(
        Enum("easy", "medium", "hard", name="assessment_difficulty_enum"), 
        nullable=False
    )
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    time_limit_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    pass_score_pct: Mapped[float] = mapped_column(DECIMAL(5, 2), default=60.00, nullable=False)
    irt_params: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    career: Mapped[Optional["Career"]] = relationship("Career", back_populates="assessments")
    skill: Mapped[Optional["Skill"]] = relationship("Skill", back_populates="assessments")
    results: Mapped[List["AssessmentResult"]] = relationship("AssessmentResult", back_populates="assessment", cascade="all, delete-orphan")
