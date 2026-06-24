"""
Test script for the career populator service.
Run: .venv\Scripts\python scratch\test_career_populator.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.tasks.career_populator import populate_careers_from_jobs
from app.models import Career, CareerSkill, Skill, CareerRecommendation
from sqlalchemy import select, func


async def main():
    print("=" * 80)
    print("CAREER POPULATOR TEST")
    print("=" * 80)

    async with AsyncSessionLocal() as session:
        # Check current state
        careers_count = (await session.execute(select(func.count(Career.career_id)))).scalar() or 0
        skills_count = (await session.execute(select(func.count(CareerSkill.id)))).scalar() or 0
        print(f"\nBEFORE: {careers_count} careers, {skills_count} career_skills")

        # Run populator
        print("\n--- Running career populator ---")
        result = await populate_careers_from_jobs(session)
        await session.commit()
        print(f"\nResult: {result}")

        # Verify state after population
        careers_count = (await session.execute(select(func.count(Career.career_id)))).scalar() or 0
        skills_count_after = (await session.execute(select(func.count(CareerSkill.id)))).scalar() or 0
        total_skills = (await session.execute(select(func.count(Skill.skill_id)))).scalar() or 0

        print(f"\nAFTER: {careers_count} careers, {skills_count_after} career_skills, {total_skills} skills")

        # List all careers
        print("\n" + "=" * 80)
        print("ALL CAREERS")
        print("=" * 80)
        res = await session.execute(
            select(Career).order_by(Career.demand_score.desc())
        )
        for c in res.scalars().all():
            salary_str = f"Rs.{c.avg_salary_min/100000:.0f}L - Rs.{c.avg_salary_max/100000:.0f}L" if c.avg_salary_min and c.avg_salary_max else "N/A"
            print(f"  [{c.career_id:3d}] {c.title:<30s} | {c.category:<25s} | {salary_str:<20s} | Demand={float(c.demand_score):5.1f} | {c.difficulty_level}")

        # List career skills
        print("\n" + "=" * 80)
        print("CAREER SKILLS MAPPING")
        print("=" * 80)
        cs_res = await session.execute(
            select(Career.title, Skill.skill_name, CareerSkill.importance, CareerSkill.min_proficiency, CareerSkill.weightage)
            .join(CareerSkill, CareerSkill.career_id == Career.career_id)
            .join(Skill, CareerSkill.skill_id == Skill.skill_id)
            .order_by(Career.title, CareerSkill.importance)
        )
        current_career = ""
        for title, skill_name, importance, min_prof, weight in cs_res.all():
            if title != current_career:
                print(f"\n  {title}:")
                current_career = title
            print(f"    → {skill_name:<20s} | {importance:<12s} | min: {min_prof:<12s} | weight: {float(weight):.2f}")

    print("\n✅ Career populator test complete!")


if __name__ == "__main__":
    asyncio.run(main())
