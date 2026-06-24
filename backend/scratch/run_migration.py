import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append("e:/CareerAI/backend")

from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as session:
        migrations = [
            # 1. Add job_url column
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_url VARCHAR(500) NULL AFTER external_id",
            # 2. Add job_url_direct column
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_url_direct VARCHAR(500) NULL AFTER job_url",
            # 3. Add company_url column
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_url VARCHAR(300) NULL AFTER company_name",
            # 4. Add company_logo_url column
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo_url VARCHAR(500) NULL AFTER company_url",
            # 5. Add job_type column
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type ENUM('fulltime','parttime','internship','contract') NULL AFTER work_mode",
            # 6. Add currency column
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR' AFTER salary_max",
            # 7. Expand source enum
            "ALTER TABLE jobs MODIFY COLUMN source ENUM('linkedin','naukri','indeed','zip_recruiter','google','glassdoor','internal','manual') NOT NULL",
        ]
        
        for i, sql in enumerate(migrations, 1):
            try:
                await session.execute(text(sql))
                await session.commit()
                print(f"  ✅ Migration {i}/7 succeeded: {sql[:70]}...")
            except Exception as e:
                err_str = str(e)
                if "Duplicate column" in err_str or "already exists" in err_str:
                    print(f"  ⏭️  Migration {i}/7 skipped (already exists): {sql[:70]}...")
                else:
                    print(f"  ❌ Migration {i}/7 FAILED: {e}")
                await session.rollback()
        
        # Verify final schema
        print("\n" + "=" * 60)
        print("FINAL JOBS TABLE SCHEMA")
        print("=" * 60)
        res = await session.execute(text("DESCRIBE jobs"))
        for r in res.fetchall():
            print(f"  {r[0]:30s} | {r[1]}")

if __name__ == "__main__":
    asyncio.run(main())
