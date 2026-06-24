import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.api.v1.assessment import list_assessments

async def main():
    async with AsyncSessionLocal() as db:
        # Test 1: Global list loading (no filters)
        print("Testing global list loading...")
        res_global = await list_assessments(career_id=None, skill_id=None, type=None, page=1, db=db)
        print(f"Global total: {res_global['total']}")
        print(f"Global items: {[item['title'] for item in res_global['items']]}")

        # Test 2: Filter by skill_id = 1 (Kotlin)
        print("\nTesting filter by Kotlin skill_id=1...")
        res_skill = await list_assessments(career_id=None, skill_id="1", type=None, page=1, db=db)
        print(f"Skill total: {res_skill['total']}")
        print(f"Skill items: {[item['title'] for item in res_skill['items']]}")

if __name__ == "__main__":
    asyncio.run(main())
