import logging
from typing import List, Dict, Any, Callable
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Notification

logger = logging.getLogger("notification_service")

class NotificationService:
    """
    Event-Driven Observer Notification Service.
    Maintains list of active observer callbacks to broadcast real-time alert notifications.
    """
    def __init__(self):
        self._observers: List[Callable] = []

    def attach_observer(self, callback: Callable):
        """Register an active alert observer callback."""
        if callback not in self._observers:
            self._observers.append(callback)
            logger.info("Attached alert observer to notification manager.")

    def detach_observer(self, callback: Callable):
        """Remove a registered alert observer."""
        if callback in self._observers:
            self._observers.remove(callback)

    async def notify_observers(self, message: str, payload: Dict[str, Any]):
        """Broadcast real-time alert data concurrently to all registered observers."""
        for callback in self._observers:
            try:
                import inspect
                if inspect.iscoroutinefunction(callback):
                    await callback(message, payload)
                else:
                    callback(message, payload)
            except Exception as e:
                logger.error(f"Observer callback failed to execute: {e}")

    async def send_system_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        type: str,
        db: AsyncSession
    ) -> Notification:
        """Create and queue a persistent system notification."""
        new_notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            channel="in_app,email",
            is_read=False
        )
        db.add(new_notification)
        await db.flush()
        
        # Broadcast real-time alert data to WebSocket observer loops
        await self.notify_observers(
            message=f"New {type} alert: {title}",
            payload={"notification_id": new_notification.notification_id, "user_id": user_id}
        )
        
        return new_notification

notification_service = NotificationService()
