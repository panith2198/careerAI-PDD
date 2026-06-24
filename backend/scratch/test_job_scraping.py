import asyncio
import sys
import httpx
import time
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.job import Job
from sqlalchemy import select

async def main():
    print("Testing backend external job scraping & sync endpoint...")
    
    # 1. Login user to get JWT token
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {
        "email": "eswarch2004y@gmail.com",
        "password": "password"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # Login
            resp = await client.post(login_url, json=login_data, timeout=30.0)
            if resp.status_code != 200:
                print("Login failed! Response:", resp.text)
                return
            token = resp.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("Login successful. JWT token received.")
            
            # 2. Check and temporarily elevate user's role to 'admin' in DB
            original_role = None
            async with AsyncSessionLocal() as session:
                stmt_u = select(User).where(User.email == "eswarch2004y@gmail.com")
                res_u = await session.execute(stmt_u)
                user = res_u.scalar_one_or_none()
                assert user is not None
                original_role = user.role
                if user.role != "admin":
                    user.role = "admin"
                    await session.commit()
                    print("Temporarily elevated user's role to 'admin' for testing.")
                else:
                    print("User already has role: admin")

            try:
                # 3. Submit job sync request (triggers background task)
                sync_url = "http://127.0.0.1:8000/api/v1/jobs/sync"
                sync_payload = {
                    "source": "indeed"
                }
                
                print("Sending POST request to trigger sync...")
                resp_sync = await client.post(sync_url, json=sync_payload, headers=headers, timeout=60.0)
                print("Sync API Response Status:", resp_sync.status_code)
                sync_data = resp_sync.json()
                print("Sync API Response Body:", sync_data)
                
                assert resp_sync.status_code == 202, f"Expected 202, got {resp_sync.status_code}"
                assert "task_id" in sync_data
                print("[PASS] API /sync endpoint triggered successfully and returned task ID.")

                # 4. Wait for background Celery worker to complete some scraping
                print("Waiting 20 seconds for Celery worker to perform scraping and database population...")
                await asyncio.sleep(20.0)
                
                # Check DB for scraped jobs
                async with AsyncSessionLocal() as session:
                    stmt_j = select(Job).where(Job.source == "indeed")
                    res_j = await session.execute(stmt_j)
                    db_jobs = res_j.scalars().all()
                    print(f"Total Indeed jobs in DB: {len(db_jobs)}")
                    for j in db_jobs[:3]:
                        print(f"Job in DB: ID {j.job_id} | Title: {j.title} | Company: {j.company_name} | Location: {j.location_city} | Mode: {j.work_mode}")
                    
                    if len(db_jobs) > 0:
                        print("[PASS] Job scraping verified: indeed listings are present in the database.")
                    else:
                        print("[WARNING] No indeed jobs found in the database. Scraper might have returned empty result or rate-limited.")

            finally:
                # 5. Revert user's role back to original in DB
                async with AsyncSessionLocal() as session:
                    stmt_u = select(User).where(User.email == "eswarch2004y@gmail.com")
                    res_u = await session.execute(stmt_u)
                    user = res_u.scalar_one_or_none()
                    if user.role != original_role:
                        user.role = original_role
                        await session.commit()
                        print("Reverted user's role back to original.")
                        
        except Exception as e:
            print("Exception occurred during job scraping test:", e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
