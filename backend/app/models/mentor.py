import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey, JSON, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Mentor(Base):
    __tablename__ = "mentors"
    
    mentor_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    
    designation: Mapped[str] = mapped_column(String(150), nullable=False)
    years_experience: Mapped[int] = mapped_column(Integer, nullable=False)
    expertise_skills_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    hourly_rate_inr: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    availability_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    rating_avg: Mapped[float] = mapped_column(DECIMAL(3, 2), default=0.00, nullable=False)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    bio: Mapped[str] = mapped_column(String, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mentor_profile")
