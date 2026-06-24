import asyncio
import sys
import httpx
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models import User, Job, JobApplication
from sqlalchemy import select

async def main():
    print("Testing backend job bookmarking (save/unsave) endpoints...")
    
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
            
            # Find a valid job ID and get user ID
            job_id = None
            user_id = None
            async with AsyncSessionLocal() as session:
                stmt_j = select(Job).where(Job.is_active == True)
                res_j = await session.execute(stmt_j)
                job = res_j.scalars().first()
                if not job:
                    print("No active jobs in database! Cannot run save test.")
                    return
                job_id = job.job_id
                
                stmt_u = select(User).where(User.email == "eswarch2004y@gmail.com")
                res_u = await session.execute(stmt_u)
                user = res_u.scalar_one_or_none()
                user_id = user.user_id
                
                print(f"Using Job ID: {job_id} for User ID: {user_id}")

                # Check if user already has an application/bookmark to this job, and delete if exists to start fresh
                stmt_del = select(JobApplication).where(
                    JobApplication.user_id == user_id,
                    JobApplication.job_id == job_id
                )
                res_del = await session.execute(stmt_del)
                existing = res_del.scalar_one_or_none()
                if existing:
                    await session.delete(existing)
                    await session.commit()
                    print("Deleted pre-existing interaction to start test fresh.")

            # 2. Save the job
            save_url = f"http://127.0.0.1:8000/api/v1/jobs/{job_id}/save"
            resp_save = await client.post(save_url, headers=headers, timeout=30.0)
            print("Save API Response Status:", resp_save.status_code)
            print("Save API Response Body:", resp_save.json())
            
            assert resp_save.status_code == 201, f"Expected 201, got {resp_save.status_code}"
            
            # Verify bookmark is committed in DB
            async with AsyncSessionLocal() as session:
                stmt_v = select(JobApplication).where(
                    JobApplication.user_id == user_id,
                    JobApplication.job_id == job_id
                )
                res_v = await session.execute(stmt_v)
                app_record = res_v.scalar_one_or_none()
                assert app_record is not None, "FAIL: Bookmark was not committed in the database!"
                assert app_record.status == "saved", f"FAIL: Expected status 'saved', got '{app_record.status}'"
                print("[PASS] Successfully verified saved bookmark in DB.")

            # 3. Unsave the job
            unsave_url = f"http://127.0.0.1:8000/api/v1/jobs/{job_id}/save"
            resp_unsave = await client.delete(unsave_url, headers=headers, timeout=30.0)
            print("Unsave API Response Status:", resp_unsave.status_code)
            
            assert resp_unsave.status_code == 204, f"Expected 204, got {resp_unsave.status_code}"
            
            # Verify bookmark is deleted from DB
            async with AsyncSessionLocal() as session:
                stmt_v2 = select(JobApplication).where(
                    JobApplication.user_id == user_id,
                    JobApplication.job_id == job_id
                )
                res_v2 = await session.execute(stmt_v2)
                app_record2 = res_v2.scalar_one_or_none()
                assert app_record2 is None, "FAIL: Bookmark was not deleted from the database!"
                print("[PASS] Successfully verified bookmark deletion from DB.")

        except Exception as e:
            print("Exception occurred during job bookmark test:", e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
