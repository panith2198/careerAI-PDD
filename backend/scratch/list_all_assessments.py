import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.models import Assessment

async def main():
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        stmt = select(Assessment)
        res = await db.execute(stmt)
        assessments = res.scalars().all()
        
        print(f"Total assessments in database: {len(assessments)}")
        for a in assessments:
            print(f"ID: {a.assessment_id}, Title: {a.title}, Skill ID: {a.skill_id}, Career ID: {a.career_id}")

if __name__ == "__main__":
    asyncio.run(main())
