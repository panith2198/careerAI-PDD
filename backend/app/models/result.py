import datetime
from typing import Optional
from sqlalchemy import Integer, DateTime, ForeignKey, JSON, DECIMAL, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    
    result_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    assessment_id: Mapped[int] = mapped_column(Integer, ForeignKey("assessments.assessment_id", ondelete="CASCADE"), nullable=False)
    
    score: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False)
    percentile_rank: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2), nullable=True)
    time_taken_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    answers_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    ai_feedback: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    gap_analysis_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    completed_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="assessment_results")
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="results")
