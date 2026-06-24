import sys
import asyncio
sys.path.append("e:/CareerAI/backend")

from app.tasks.sync_tasks import async_sync_external_jobs
from app.core.database import AsyncSessionLocal
from app.models import Job
from sqlalchemy import select

async def main():
    print("Running async sync for 'indeed' source...")
    # Trigger the sync function directly (bypassing celery for testing)
    result = await async_sync_external_jobs("indeed")
    print("\nSync Result:")
    print(result)
    
    # Check the database for the latest jobs and check their fields
    async with AsyncSessionLocal() as session:
        stmt = select(Job).order_by(Job.job_id.desc()).limit(15)
        res = await session.execute(stmt)
        jobs = res.scalars().all()
        
        print("\nLatest 15 Jobs in database after sync:")
        for j in jobs:
            print(f"ID: {j.job_id} | Title: {j.title} | Company: {j.company_name} | Location: {j.location_city} | Skills: {j.required_skills_json} | WorkMode: {j.work_mode}")

if __name__ == "__main__":
    asyncio.run(main())
