import asyncio
import sys
import httpx
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.job import Job
from sqlalchemy import select

async def main():
    print("Testing backend native job posting endpoint...")
    
    # 1. Login user to get JWT token
    login_url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {
        "email": "eswarch2004y@gmail.com",
        "password": "password"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # Login
            resp = await client.post(login_url, json=login_data)
            if resp.status_code != 200:
                print("Login failed! Response:", resp.text)
                return
            token = resp.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("Login successful. JWT token received.")
            
            # 2. Check and temporarily elevate user's role to 'mentor' in DB if they are not admin/mentor
            async with AsyncSessionLocal() as session:
                stmt_u = select(User).where(User.email == "eswarch2004y@gmail.com")
                res_u = await session.execute(stmt_u)
                user = res_u.scalar_one_or_none()
                assert user is not None
                original_role = user.role
                if user.role not in ("admin", "mentor"):
                    user.role = "mentor"
                    await session.commit()
                    print("Temporarily elevated user's role to 'mentor' for testing.")
                else:
                    print(f"User already has role: {user.role}")

            # 3. Submit job creation request
            create_url = "http://127.0.0.1:8000/api/v1/jobs/create"
            job_payload = {
                "title": "Senior React Engineer (Matched)",
                "company_name": "DeepMind Innovations",
                "description_raw": "Looking for a seasoned frontend specialist with deep expertise in React and Vite.",
                "required_skills_json": ["React", "JavaScript", "Vite", "Git"],
                "location_city": "Bengaluru",
                "work_mode": "remote",
                "experience_min_months": 36,
                "salary_min": 1500000,
                "salary_max": 2500000,
                "is_fresher_eligible": False
            }
            
            resp_create = await client.post(create_url, json=job_payload, headers=headers)
            print("Create Job Response Status:", resp_create.status_code)
            create_data = resp_create.json()
            print("Create Job Response Body:", create_data)
            
            assert resp_create.status_code == 201, f"Expected 201, got {resp_create.status_code}"
            job_id = create_data.get("job_id")
            assert job_id is not None
            
            # 4. Verify job exists in DB
            async with AsyncSessionLocal() as session:
                stmt_j = select(Job).where(Job.job_id == job_id)
                res_j = await session.execute(stmt_j)
                db_job = res_j.scalar_one_or_none()
                assert db_job is not None, "Job not found in database!"
                assert db_job.title == "Senior React Engineer (Matched)"
                assert db_job.company_name == "DeepMind Innovations"
                assert db_job.source == "manual"
                print(f"[PASS] Job listing created and verified in database successfully. Job ID: {job_id}")

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
            print("Exception occurred during job posting test:", e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
