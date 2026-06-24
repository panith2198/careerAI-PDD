import asyncio
from app.core.database import AsyncSessionLocal
from app.models import Career
from sqlalchemy.future import select

async def run():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Career))
        for c in res.scalars().all():
            print(f"ID: {c.career_id} | Title: {c.title} | Slug: {c.slug} | Active: {c.is_active}")

if __name__ == "__main__":
    asyncio.run(run())
