import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.models import Assessment

async def main():
    async with AsyncSessionLocal() as db:
        # We delete assessments with assessment_id in [1, 2, 3, 4] or with specific titles
        titles = [
            "Kotlin Competency Validation",
            "Android Architecture Components",
            "Jetpack Compose UI Layouts",
            "Data Science Foundations"
        ]
        from sqlalchemy import select
        stmt = select(Assessment).where((Assessment.assessment_id.in_([1, 2, 3, 4])) | (Assessment.title.in_(titles)))
        res = await db.execute(stmt)
        assessments = res.scalars().all()
        
        print(f"Found {len(assessments)} mock assessments to delete:")
        for a in assessments:
            print(f"ID: {a.assessment_id}, Title: {a.title}")
            await db.delete(a)
        
        if assessments:
            await db.commit()
            print("Successfully deleted mock assessments.")
        else:
            print("No mock assessments found in database.")

if __name__ == "__main__":
    asyncio.run(main())
