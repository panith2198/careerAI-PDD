import asyncio
import sys
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models import Job
from sqlalchemy import select

async def main():
    print("Checking details of scraped jobs in the database...")
    async with AsyncSessionLocal() as session:
        stmt = select(Job).where(Job.source == "indeed").order_by(Job.job_id.desc()).limit(15)
        res = await session.execute(stmt)
        jobs = res.scalars().all()
        
        print(f"Retrieved {len(jobs)} latest Indeed jobs:")
        print("-" * 120)
        for j in jobs:
            skills = j.required_skills_json
            salary_str = f"₹{j.salary_min:,} - ₹{j.salary_max:,}" if j.salary_min or j.salary_max else "Not specified"
            print(f"ID: {j.job_id} | Title: {j.title[:30]:<30} | Company: {j.company_name[:20]:<20} | Location: {j.location_city[:20]:<20} | Salary: {salary_str:<25} | Skills: {skills}")
        print("-" * 120)

if __name__ == "__main__":
    asyncio.run(main())
