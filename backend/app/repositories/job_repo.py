from typing import List, Optional, Dict, Any
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Job, JobApplication

class JobRepository:
    """
    Job Repository managing job listings, search filter queries, and cursor pagination.
    AI Prompt Role: Job matching AI.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, job_id: int) -> Optional[Job]:
        result = await self.db.execute(select(Job).where(Job.job_id == job_id))
        return result.scalars().first()

    async def search_jobs(
        self, 
        filters: Dict[str, Any], 
        cursor_id: Optional[int] = None, 
        limit: int = 10
    ) -> List[Job]:
        """
        Filtered job search supporting cursor-based pagination for high scalability.
        """
        conditions = [Job.is_active == True]

        # Apply Filters
        if "location_city" in filters:
            conditions.append(Job.location_city.ilike(filters["location_city"]))
        if "work_mode" in filters:
            conditions.append(Job.work_mode == filters["work_mode"])
        if "fresher_eligible" in filters:
            conditions.append(Job.is_fresher_eligible == filters["fresher_eligible"])
        if "title_query" in filters:
            q = f"%{filters['title_query']}%"
            conditions.append(
                or_(
                    Job.title.ilike(q),
                    Job.company_name.ilike(q)
                )
            )

        # Cursor Pagination: Only select IDs greater than cursor
        if cursor_id:
            conditions.append(Job.job_id > cursor_id)

        stmt = select(Job).where(and_(*conditions)).order_by(Job.job_id).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def apply_to_job(self, app_record: JobApplication) -> JobApplication:
        self.db.add(app_record)
        await self.db.flush()
        return app_record

    async def get_user_applications(self, user_id: int) -> List[JobApplication]:
        stmt = select(JobApplication).where(JobApplication.user_id == user_id).order_by(desc(JobApplication.created_at))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
