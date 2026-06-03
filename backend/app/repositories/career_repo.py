from typing import List, Optional, Tuple
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Career, CareerSkill, Skill

class CareerRepository:
    """
    Career Repository managing career paths, graph adjacencies, and role listings.
    AI Prompt Role: Career intelligence engine.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, career_id: int) -> Optional[Career]:
        result = await self.db.execute(select(Career).where(Career.career_id == career_id))
        return result.scalars().first()

    async def get_by_slug(self, slug: str) -> Optional[Career]:
        result = await self.db.execute(select(Career).where(Career.slug == slug))
        return result.scalars().first()

    async def search_careers(self, query: str, limit: int = 10) -> List[Career]:
        """Search roles matching text pattern in title or description."""
        stmt = select(Career).where(
            or_(
                Career.title.ilike(f"%{query}%"),
                Career.description.ilike(f"%{query}%")
            )
        ).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def fetch_career_skills(self, career_id: int) -> List[Tuple[Skill, str, float]]:
        """Fetch all required skills, their importance, and weightages for a career."""
        stmt = (
            select(Skill, CareerSkill.importance, CareerSkill.weightage)
            .join(CareerSkill, CareerSkill.skill_id == Skill.skill_id)
            .where(CareerSkill.career_id == career_id)
        )
        result = await self.db.execute(stmt)
        return list(result.all())

    async def get_all_active(self) -> List[Career]:
        result = await self.db.execute(select(Career).where(Career.is_active == True))
        return list(result.scalars().all())
