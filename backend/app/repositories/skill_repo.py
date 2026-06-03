from typing import List, Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Skill, UserSkill

class SkillRepository:
    """
    Skill Repository managing canonical taxonomies and autocomplete searches.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, skill_id: int) -> Optional[Skill]:
        result = await self.db.execute(select(Skill).where(Skill.skill_id == skill_id))
        return result.scalars().first()

    async def get_by_name(self, name: str) -> Optional[Skill]:
        result = await self.db.execute(select(Skill).where(Skill.skill_name.ilike(name.strip())))
        return result.scalars().first()

    async def autocomplete_skills(self, prefix: str, limit: int = 10) -> List[Skill]:
        """Trie-equivalent SQL prefix match autocomplete search."""
        stmt = select(Skill).where(
            or_(
                Skill.skill_name.ilike(f"{prefix}%"),
                Skill.skill_slug.ilike(f"{prefix}%")
            )
        ).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def fetch_user_skills(self, user_id: int) -> List[UserSkill]:
        """Fetch all declared and verified skills for a user."""
        stmt = select(UserSkill).where(UserSkill.user_id == user_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def add_user_skill(self, user_skill: UserSkill) -> UserSkill:
        self.db.add(user_skill)
        await self.db.flush()
        return user_skill
