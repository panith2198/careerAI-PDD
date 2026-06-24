import asyncio
import sys
import os
from fastapi.testclient import TestClient

# Adjust path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.core.security import create_access_token
from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from app.models import CareerRecommendation, Career

async def run_test():
    client = TestClient(app)
    
    # 1. Create a valid token for user_id = 5 (Eswar)
    token = create_access_token(5)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Call career recommendation endpoint with force_refresh = True
    payload = {
        "force_refresh": True
    }
    
    print("Calling recommend endpoint...")
    response = client.post("/api/v1/career/recommend", json=payload, headers=headers)
    print("STATUS CODE:", response.status_code)
    resp_data = response.json()
    print("RESPONSE CAREERS:")
    for career in resp_data.get("careers", []):
        print(f"- {career['title']}: score = {career['fit_score']} | reasoning: {career['reasoning']} | missing: {career['gap_skills']['missing']}")
        
    # 3. Check the database to see recommendations for user 5
    async with AsyncSessionLocal() as session:
        res = await session.execute(
            select(
                CareerRecommendation.rec_id,
                Career.title,
                CareerRecommendation.fit_score,
                CareerRecommendation.rank,
                CareerRecommendation.reasoning_json
            )
            .join(Career, CareerRecommendation.career_id == Career.career_id)
            .where(CareerRecommendation.user_id == 5)
            .order_by(CareerRecommendation.rank)
        )
        rows = res.all()
        print("\nRecommendations for user 5 in DB:")
        for r in rows:
            print(f"Rank {r[3]}: {r[1]} | Fit Score: {r[2]}% | Reasoning: {r[4]}")

if __name__ == "__main__":
    asyncio.run(run_test())
