import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT c.title, s.skill_name, cs.importance 
            FROM career_skills cs 
            JOIN careers c ON cs.career_id = c.career_id 
            JOIN skills s ON cs.skill_id = s.skill_id
        """))
        for row in res.fetchall():
            print(f"Career: {row[0]} | Skill: {row[1]} | Importance: {row[2]}")

if __name__ == "__main__":
    asyncio.run(main())
