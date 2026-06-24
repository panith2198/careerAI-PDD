import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT u.user_id, u.full_name, s.skill_name, us.proficiency_level
            FROM user_skills us
            JOIN users u ON us.user_id = u.user_id
            JOIN skills s ON us.skill_id = s.skill_id
        """))
        for row in res.fetchall():
            print(f"User ID: {row[0]} | Name: {row[1]} | Skill: {row[2]} | Level: {row[3]}")

if __name__ == "__main__":
    asyncio.run(main())
