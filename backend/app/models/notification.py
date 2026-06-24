import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    
    notification_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    
    type: Mapped[str] = mapped_column(
        Enum("system", "job_match", "roadmap", "assessment", "ai_tip", name="notification_type_enum"), 
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    action_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    channel: Mapped[str] = mapped_column(String(100), nullable=False)
    sent_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")
