import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT cr.rank, c.title, cr.fit_score, cr.reasoning_json, cr.gap_skills_json
            FROM career_recommendations cr
            JOIN careers c ON cr.career_id = c.career_id
            WHERE cr.user_id = 5
            ORDER BY cr.created_at DESC, cr.rank ASC
            LIMIT 5
        """))
        rows = res.fetchall()
        print("Latest Recommendations in DB:")
        for row in rows:
            print(f"Rank {row[0]}: {row[1]} | Fit: {row[2]}% | Reasoning: {row[3]} | Gap: {row[4]}")

if __name__ == "__main__":
    asyncio.run(main())
