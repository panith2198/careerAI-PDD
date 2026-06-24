import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT career_id, title, category FROM careers"))
        for row in res.fetchall():
            print(f"ID: {row[0]} | Title: {row[1]} | Category: {row[2]}")

if __name__ == "__main__":
    asyncio.run(main())
