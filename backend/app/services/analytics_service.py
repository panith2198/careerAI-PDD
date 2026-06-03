import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.models import AuditLog

logger = logging.getLogger("analytics_service")

class AnalyticsService:
    """
    Progress & Metric Analytics Service.
    Aggregates database metrics and compiles cohort analytics from security audit logs.
    """
    
    @staticmethod
    async def get_system_audit_summaries(
        db: AsyncSession,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Fetch general transaction statistics from the system audit log tables."""
        stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
        res = await db.execute(stmt)
        logs = res.scalars().all()
        
        summarized = []
        for log in logs:
            summarized.append({
                "log_id": log.log_id,
                "user_id": log.user_id,
                "action": log.action,
                "resource_type": log.resource_type,
                "duration_ms": log.duration_ms,
                "timestamp": log.created_at
            })
            
        return summarized

    @staticmethod
    async def get_cohort_transaction_volume(
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Aggregate total audit log actions by classification categories."""
        stmt = select(AuditLog.action, func.count(AuditLog.log_id)).group_by(AuditLog.action)
        res = await db.execute(stmt)
        results = res.all()
        
        aggregates = {}
        for action, count in results:
            aggregates[action] = count
            
        return {
            "total_audit_actions": sum(aggregates.values()),
            "action_aggregates": aggregates
        }

analytics_service = AnalyticsService()
