import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey, JSON, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    roadmap_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    career_id: Mapped[int] = mapped_column(Integer, ForeignKey("careers.career_id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    total_weeks: Mapped[int] = mapped_column(Integer, nullable=False)
    hours_per_week: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("draft", "active", "completed", "paused", name="roadmap_status_enum"), 
        default="draft", 
        nullable=False
    )
    completion_pct: Mapped[float] = mapped_column(DECIMAL(5, 2), default=0.00, nullable=False)
    ai_model_used: Mapped[str] = mapped_column(String(50), nullable=False)
    milestones_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    generated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    last_activity_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="roadmaps")
    career: Mapped["Career"] = relationship("Career", back_populates="roadmaps")
