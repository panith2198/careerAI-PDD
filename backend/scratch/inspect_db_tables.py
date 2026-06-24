import asyncio
import sys
import json
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from app.models import Job, JobApplication
from sqlalchemy import select, func, text, inspect as sa_inspect

async def main():
    async with AsyncSessionLocal() as session:
        # ── 1. Jobs table schema ──
        print("=" * 80)
        print("JOBS TABLE - Column Details")
        print("=" * 80)
        res = await session.execute(text("DESCRIBE jobs"))
        rows = res.fetchall()
        for r in rows:
            print(f"  {r[0]:30s} | {r[1]:30s} | Null={r[2]:4s} | Key={r[3] or '-':5s} | Default={r[4] or 'NULL'}")

        # ── 2. Job Applications table schema ──
        print("\n" + "=" * 80)
        print("JOB_APPLICATIONS TABLE - Column Details")
        print("=" * 80)
        res2 = await session.execute(text("DESCRIBE job_applications"))
        rows2 = res2.fetchall()
        for r in rows2:
            print(f"  {r[0]:30s} | {r[1]:30s} | Null={r[2]:4s} | Key={r[3] or '-':5s} | Default={r[4] or 'NULL'}")

        # ── 3. Jobs stats ──
        print("\n" + "=" * 80)
        print("JOBS TABLE - Statistics")
        print("=" * 80)
        total = (await session.execute(select(func.count(Job.job_id)))).scalar()
        active = (await session.execute(select(func.count(Job.job_id)).where(Job.is_active == True))).scalar()
        print(f"  Total jobs: {total}")
        print(f"  Active jobs: {active}")

        # Unique locations
        loc_res = await session.execute(
            select(Job.location_city, func.count(Job.job_id))
            .group_by(Job.location_city)
            .order_by(func.count(Job.job_id).desc())
        )
        print("\n  Locations breakdown:")
        for city, cnt in loc_res.all():
            print(f"    {city or 'NULL':25s} → {cnt} jobs")

        # Unique sources
        src_res = await session.execute(
            select(Job.source, func.count(Job.job_id))
            .group_by(Job.source)
            .order_by(func.count(Job.job_id).desc())
        )
        print("\n  Sources breakdown:")
        for src, cnt in src_res.all():
            print(f"    {src or 'NULL':25s} → {cnt} jobs")

        # Work modes
        wm_res = await session.execute(
            select(Job.work_mode, func.count(Job.job_id))
            .group_by(Job.work_mode)
            .order_by(func.count(Job.job_id).desc())
        )
        print("\n  Work mode breakdown:")
        for wm, cnt in wm_res.all():
            print(f"    {wm or 'NULL':25s} → {cnt} jobs")

        # Skills coverage
        with_skills = (await session.execute(
            select(func.count(Job.job_id)).where(Job.required_skills_json != '[]', Job.required_skills_json.isnot(None))
        )).scalar()
        print(f"\n  Jobs with skills populated: {with_skills} / {total}")

        # Salary coverage
        with_salary = (await session.execute(
            select(func.count(Job.job_id)).where(Job.salary_min.isnot(None))
        )).scalar()
        print(f"  Jobs with salary data: {with_salary} / {total}")

        # ── 4. Sample jobs (latest 10) ──
        print("\n" + "=" * 80)
        print("LATEST 10 JOBS")
        print("=" * 80)
        latest = await session.execute(select(Job).order_by(Job.job_id.desc()).limit(10))
        for j in latest.scalars().all():
            skills = j.required_skills_json
            if isinstance(skills, str):
                try:
                    skills = json.loads(skills)
                except:
                    skills = []
            print(f"  ID={j.job_id:3d} | {j.title[:50]:50s} | {j.company_name[:25]:25s} | Loc={j.location_city or 'N/A':15s} | Mode={j.work_mode:8s} | Salary={j.salary_min or 0}-{j.salary_max or 0} | Skills={skills}")

        # ── 5. Job Applications stats ──
        print("\n" + "=" * 80)
        print("JOB_APPLICATIONS TABLE - Statistics")
        print("=" * 80)
        total_apps = (await session.execute(select(func.count(JobApplication.application_id)))).scalar()
        print(f"  Total applications: {total_apps}")

        status_res = await session.execute(
            select(JobApplication.status, func.count(JobApplication.application_id))
            .group_by(JobApplication.status)
        )
        print("\n  Status breakdown:")
        for st, cnt in status_res.all():
            print(f"    {st or 'NULL':25s} → {cnt}")

        # Sample applications
        if total_apps > 0:
            print("\n  Recent applications:")
            app_res = await session.execute(
                select(JobApplication, Job)
                .join(Job, JobApplication.job_id == Job.job_id)
                .order_by(JobApplication.application_id.desc())
                .limit(5)
            )
            for app, job in app_res.all():
                print(f"    AppID={app.application_id} | JobID={app.job_id} | Title={job.title[:40]:40s} | Status={app.status:10s} | Score={app.match_score} | Applied={app.applied_at}")

if __name__ == "__main__":
    asyncio.run(main())
