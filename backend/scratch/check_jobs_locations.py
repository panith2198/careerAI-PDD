import asyncio
import sys
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models import Job
from sqlalchemy import select, func

async def main():
    async with AsyncSessionLocal() as session:
        # Check all unique location values
        stmt = select(Job.location_city, func.count(Job.job_id)).group_by(Job.location_city)
        res = await session.execute(stmt)
        rows = res.all()
        print("Unique locations in DB and their counts:")
        for city, count in rows:
            print(f"- {city}: {count} jobs")
            
        print("\nLatest 10 jobs in database:")
        stmt_latest = select(Job).order_by(Job.job_id.desc()).limit(10)
        res_latest = await session.execute(stmt_latest)
        for j in res_latest.scalars().all():
            print(f"ID: {j.job_id} | Title: {j.title} | Company: {j.company_name} | Location: {j.location_city}")

if __name__ == "__main__":
    asyncio.run(main())
