import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.algorithms.recommendation import RecommendationEngineAlg

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        # Load user skills (User 5 - Eswar)
        res = await conn.execute(text("""
            SELECT s.skill_name
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.user_id = 5
        """))
        user_skills = [row[0] for row in res.fetchall()]
        print("User Skills:", user_skills)

        # Load careers taxonomy
        res_careers = await conn.execute(text("SELECT career_id, title FROM careers WHERE is_active = 1"))
        careers = res_careers.fetchall()
        
        taxonomy = {}
        for cid, title in careers:
            res_skills = await conn.execute(text("""
                SELECT s.skill_name 
                FROM career_skills cs 
                JOIN skills s ON cs.skill_id = s.skill_id 
                WHERE cs.career_id = :cid
            """), {"cid": cid})
            taxonomy[title] = [row[0] for row in res_skills.fetchall()]
            
        print("Taxonomy:", taxonomy)
        
        # Test recommendation
        recs = RecommendationEngineAlg.recommend_careers(user_skills, taxonomy, top_n=5)
        print("\nRecommendations with scores:")
        for score, title in recs:
            print(f"- {title}: score = {score:.4f}")

if __name__ == "__main__":
    asyncio.run(main())
