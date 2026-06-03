import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"
    
    application_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.job_id", ondelete="CASCADE"), nullable=False)
    
    match_score: Mapped[Optional[float]] = mapped_column(DECIMAL(5, 2), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("saved", "applied", "interview", "offered", "rejected", "withdrawn", name="application_status_enum"), 
        default="saved", 
        nullable=False
    )
    cover_letter: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ai_interview_tips: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    applied_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    status_updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="applications")
    job: Mapped["Job"] = relationship("Job", back_populates="applications")
