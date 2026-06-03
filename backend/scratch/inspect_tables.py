import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def main():
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.connect() as conn:
            print("--- roadmaps ---")
            res = await conn.execute(text("SELECT * FROM roadmaps LIMIT 5"))
            keys = res.keys()
            for r in res.fetchall():
                print(dict(zip(keys, r)))

            print("\n--- assessments ---")
            res = await conn.execute(text("SELECT * FROM assessments LIMIT 5"))
            keys = res.keys()
            for r in res.fetchall():
                print(dict(zip(keys, r)))

            print("\n--- assessment_results ---")
            res = await conn.execute(text("SELECT * FROM assessment_results LIMIT 5"))
            keys = res.keys()
            for r in res.fetchall():
                print(dict(zip(keys, r)))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
