import asyncio
import sys
import os

# Adjust path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tasks.ai_tasks import update_roadmap_milestones_db
from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from app.models import Roadmap

async def run_test():
    print("Testing update_roadmap_milestones_db for user_id=5, career_id=1")
    # First, let's reset a roadmap's status to 'draft' or create one so the function finds it
    async with AsyncSessionLocal() as db:
        stmt = select(Roadmap).where(
            Roadmap.user_id == 5,
            Roadmap.career_id == 1
        ).order_by(Roadmap.generated_at.desc())
        res = await db.execute(stmt)
        roadmap = res.scalars().first()
        if roadmap:
            print(f"Found roadmap {roadmap.roadmap_id}. Resetting status to 'draft' and milestones_json to empty dict.")
            roadmap.status = "draft"
            roadmap.milestones_json = {}
            await db.commit()
        else:
            print("No roadmap found for user_id=5, career_id=1. Creating a draft roadmap.")
            new_r = Roadmap(
                user_id=5,
                career_id=1,
                title="Draft Roadmap",
                total_weeks=12,
                hours_per_week=10,
                status="draft",
                completion_pct=0.0,
                ai_model_used="test",
                milestones_json={}
            )
            db.add(new_r)
            await db.commit()

    try:
        await update_roadmap_milestones_db(user_id=5, career_id=1)
        print("Success! milestones updated.")
        
        # Verify the database
        async with AsyncSessionLocal() as db:
            stmt = select(Roadmap).where(
                Roadmap.user_id == 5,
                Roadmap.career_id == 1
            ).order_by(Roadmap.generated_at.desc())
            res = await db.execute(stmt)
            roadmap = res.scalars().first()
            print(f"Updated Roadmap Details: ID: {roadmap.roadmap_id}, Title: {roadmap.title}, Status: {roadmap.status}, Milestones: {roadmap.milestones_json}")
    except Exception as e:
        print(f"Exception raised: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_test())
