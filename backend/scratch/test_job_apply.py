import asyncio
import sys
import httpx
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models import User, Job, Resume, JobApplication
from sqlalchemy import select

async def main():
    print("Testing backend job application endpoint...")
    
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
                    print("No active jobs in database! Cannot run apply test.")
                    return
                job_id = job.job_id
                
                stmt_u = select(User).where(User.email == "eswarch2004y@gmail.com")
                res_u = await session.execute(stmt_u)
                user = res_u.scalar_one_or_none()
                user_id = user.user_id
                
                print(f"Using Job ID: {job_id} for User ID: {user_id}")

                # Check if user already applied to this job, and delete if exists to start fresh
                stmt_del = select(JobApplication).where(
                    JobApplication.user_id == user_id,
                    JobApplication.job_id == job_id
                )
                res_del = await session.execute(stmt_del)
                existing = res_del.scalar_one_or_none()
                if existing:
                    await session.delete(existing)
                    await session.commit()
                    print("Deleted pre-existing application to start test fresh.")
            
            # Create a mock resume for this user if one doesn't exist
            resume_id = None
            async with AsyncSessionLocal() as session:
                stmt_res = select(Resume).where(Resume.user_id == user_id)
                res_res = await session.execute(stmt_res)
                res = res_res.scalars().first()
                if not res:
                    new_res = Resume(
                        user_id=user_id,
                        file_url="storage/resumes/mock_resume.pdf",
                        structured_json={},
                        skills_extracted={},
                        ats_score=85,
                        parse_status="completed"
                    )
                    session.add(new_res)
                    await session.commit()
                    resume_id = new_res.resume_id
                    print(f"Created a mock resume with ID: {resume_id}")
                else:
                    resume_id = res.resume_id
                    print(f"Using existing resume with ID: {resume_id}")

            # 3. Submit application
            apply_url = f"http://127.0.0.1:8000/api/v1/jobs/{job_id}/apply"
            apply_payload = {
                "resume_id": resume_id,
                "cover_note": "I would love to apply for this exciting opportunity!"
            }
            
            resp_apply = await client.post(apply_url, json=apply_payload, headers=headers, timeout=30.0)
            print("Apply API Response Status:", resp_apply.status_code)
            apply_data = resp_apply.json()
            print("Apply API Response Body:", apply_data)
            
            assert resp_apply.status_code == 201, f"Expected 201, got {resp_apply.status_code}"
            assert apply_data["status"] == "applied"
            print("[PASS] API returned 201 created and status applied.")

            # 4. Verify that the application is committed in the DB
            async with AsyncSessionLocal() as session:
                stmt_v = select(JobApplication).where(
                    JobApplication.user_id == user_id,
                    JobApplication.job_id == job_id
                )
                res_v = await session.execute(stmt_v)
                app_record = res_v.scalar_one_or_none()
                
                assert app_record is not None, "FAIL: Application was not committed in the database!"
                assert app_record.status == "applied", f"FAIL: Expected status 'applied', got '{app_record.status}'"
                assert app_record.cover_letter == "I would love to apply for this exciting opportunity!"
                print(f"[PASS] Successfully verified application commit in DB. App ID: {app_record.application_id}")

        except Exception as e:
            print("Exception occurred during job apply test:", e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
