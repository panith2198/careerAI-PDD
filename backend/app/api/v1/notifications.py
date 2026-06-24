import datetime
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc
from pydantic import BaseModel

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Notification

logger = logging.getLogger("notifications_api")

router = APIRouter()

# Schema definitions for payloads
class NotificationReadPayload(BaseModel):
    is_read: bool

@router.get("/list")
async def list_notifications(
    unread_only: Optional[bool] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch paginated list of notifications for the logged-in user.
    Seeds realistic notifications if user has no entries.
    """
    # Check if this user has any notifications in the database.
    count_stmt_all = select(func.count(Notification.notification_id)).where(
        Notification.user_id == current_user.user_id
    )
    count_res_all = await db.execute(count_stmt_all)
    total_in_db = count_res_all.scalar() or 0

    if total_in_db == 0:
        now = datetime.datetime.utcnow()
        seed_notifications = [
            Notification(
                user_id=current_user.user_id,
                type="system",
                title="Welcome to CareerAI Navigator",
                message=f"Hello {current_user.full_name or 'User'}, welcome to your customized smart career dashboard. Let's achieve...",
                action_url="/dashboard",
                is_read=False,
                channel="in_app",
                created_at=now - datetime.timedelta(minutes=5)
            ),
            Notification(
                user_id=current_user.user_id,
                type="job_match",
                title="New Python Developer Role",
                message="A job match matching 90% of your skillset has been posted at TechCorp.",
                action_url="/jobs",
                is_read=False,
                channel="in_app",
                created_at=now - datetime.timedelta(hours=2)
            ),
            Notification(
                user_id=current_user.user_id,
                type="roadmap",
                title="Next Milestone Ready",
                message="Your customized Python backend path is ready. Click to view the first milestone.",
                action_url="/roadmap",
                is_read=False,
                channel="in_app",
                created_at=now - datetime.timedelta(hours=4)
            ),
            Notification(
                user_id=current_user.user_id,
                type="ai_tip",
                title="AI Career Recommendation",
                message="Based on your assessment results, focus on FastAPI to boost your job fit percentage.",
                action_url="/assessment",
                is_read=False,
                channel="in_app",
                created_at=now - datetime.timedelta(days=1)
            ),
            Notification(
                user_id=current_user.user_id,
                type="system",
                title="Upcoming System Update",
                message="A new platform upgrade is scheduled for this weekend. Stay tuned!",
                action_url="/dashboard",
                is_read=True,
                channel="in_app",
                created_at=now - datetime.timedelta(days=2)
            )
        ]
        db.add_all(seed_notifications)
        await db.commit()

    offset = (page - 1) * limit
    conditions = [Notification.user_id == current_user.user_id]

    if unread_only is True:
        conditions.append(Notification.is_read == False)
    elif unread_only is False:
        conditions.append(Notification.is_read == True)

    # 1. Total matching count
    count_stmt = select(func.count(Notification.notification_id)).where(and_(*conditions))
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    # 2. Paginated selection
    stmt = (
        select(Notification)
        .where(and_(*conditions))
        .order_by(desc(Notification.created_at))
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    items = res.scalars().all()

    formatted_items = []
    for item in items:
        formatted_items.append({
            "id": item.notification_id,  # Map to "id" field expected by Android client DTO
            "notification_id": item.notification_id,
            "type": item.type,
            "title": item.title,
            "message": item.message,
            "action_url": item.action_url,
            "is_read": item.is_read,
            "channel": item.channel,
            "sent_at": item.sent_at.isoformat() if item.sent_at else None,
            "created_at": item.created_at.isoformat(),
            "target_id": None,
            "target_type": None
        })

    return {
        "items": formatted_items,
        "total": total
    }

# Accept both POST and PATCH for read-all compatibility
@router.post("/read-all")
@router.patch("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark all unread notifications of the current user as read.
    """
    stmt = select(Notification).where(
        Notification.user_id == current_user.user_id,
        Notification.is_read == False
    )
    res = await db.execute(stmt)
    unread_notifications = res.scalars().all()

    for item in unread_notifications:
        item.is_read = True
        item.sent_at = datetime.datetime.utcnow()

    await db.commit()

    return {
        "message": "all notifications marked as read"
    }

@router.patch("/{id}/read")
async def mark_notification_read(
    id: int,
    payload: Optional[NotificationReadPayload] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the read status of a specific user notification.
    Accepts optional payload body, defaults is_read to True if absent.
    """
    stmt = select(Notification).where(
        Notification.notification_id == id,
        Notification.user_id == current_user.user_id
    )
    res = await db.execute(stmt)
    notification = res.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied."
        )

    is_read = payload.is_read if payload is not None else True
    notification.is_read = is_read
    if is_read:
        notification.sent_at = datetime.datetime.utcnow()

    await db.commit()

    return {
        "notification_id": notification.notification_id,
        "is_read": notification.is_read
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Hard delete a notification record.
    """
    stmt = select(Notification).where(
        Notification.notification_id == id,
        Notification.user_id == current_user.user_id
    )
    res = await db.execute(stmt)
    notification = res.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied."
        )

    await db.delete(notification)
    await db.commit()

    return None
