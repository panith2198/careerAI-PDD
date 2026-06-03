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
from app.models import Roadmap

async def run_test():
    client = TestClient(app)
    
    # 1. Create a valid token for user_id = 5
    token = create_access_token(5)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Call generate roadmap endpoint for career_id = 4 (Android Developer)
    payload = {
        "career_id": 4,
        "hours_per_week": 15,
        "target_months": 3
    }
    
    print("Calling generate endpoint for career_id=4...")
    response = client.post("/api/v1/roadmaps/generate", json=payload, headers=headers)
    print("STATUS CODE:", response.status_code)
    print("RESPONSE JSON:", response.json())
    
    # 3. Check the database to see all active roadmaps for user 5
    async with AsyncSessionLocal() as session:
        res = await session.execute(
            select(Roadmap.roadmap_id, Roadmap.career_id, Roadmap.title, Roadmap.status)
            .where(Roadmap.user_id == 5)
        )
        rows = res.all()
        print("\nRoadmaps for user 5 in DB:")
        for r in rows:
            print(f"ID: {r[0]} | Career: {r[1]} | Title: {r[2]} | Status: {r[3]}")

if __name__ == "__main__":
    asyncio.run(run_test())
