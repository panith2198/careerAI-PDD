import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def check():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        res = await session.execute(text("SHOW CREATE TABLE roadmaps"))
        row = res.first()
        print("CREATE TABLE SCHEMA:")
        print(row[1])

if __name__ == "__main__":
    asyncio.run(check())
