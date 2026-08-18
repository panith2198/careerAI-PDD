import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as session:
        columns_res = await session.execute(text("SHOW COLUMNS FROM jobs"))
        existing_columns = {row[0] for row in columns_res.fetchall()}

        migrations = [
            ("job_url", "ALTER TABLE jobs ADD COLUMN job_url VARCHAR(500) NULL AFTER external_id"),
            ("job_url_direct", "ALTER TABLE jobs ADD COLUMN job_url_direct VARCHAR(500) NULL AFTER job_url"),
            ("company_url", "ALTER TABLE jobs ADD COLUMN company_url VARCHAR(300) NULL AFTER company_name"),
            ("company_logo_url", "ALTER TABLE jobs ADD COLUMN company_logo_url VARCHAR(500) NULL AFTER company_url"),
            ("job_type", "ALTER TABLE jobs ADD COLUMN job_type ENUM('fulltime','parttime','internship','contract') NULL AFTER work_mode"),
            ("currency", "ALTER TABLE jobs ADD COLUMN currency VARCHAR(10) DEFAULT 'INR' AFTER salary_max"),
            (None, "ALTER TABLE jobs MODIFY COLUMN source ENUM('linkedin','naukri','indeed','zip_recruiter','google','glassdoor','internal','manual') NOT NULL"),
        ]
        
        for i, (column_name, sql) in enumerate(migrations, 1):
            if column_name and column_name in existing_columns:
                print(f"  ⏭️  Migration {i}/7 skipped (already exists): {column_name}")
                continue

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
