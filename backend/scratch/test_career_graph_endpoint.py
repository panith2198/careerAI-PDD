import asyncio
import json
import traceback
from app.api.v1.career import get_career_graph_path
from app.core.database import AsyncSessionLocal

async def test_endpoint():
    async with AsyncSessionLocal() as db:
        try:
            print("Calling get_career_graph_path...")
            res = await get_career_graph_path(
                from_role="ui/ux developer",
                to_role="Frontend Developer",
                db=db
            )
            print("Result:", res)
        except Exception as e:
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_endpoint())
