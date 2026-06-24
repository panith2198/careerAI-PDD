import asyncio
import sys
sys.path.insert(0, '.')

from app.core.database import AsyncSessionLocal
from app.models import Career, CareerSkill, CareerRecommendation, Skill, UserSkill
from sqlalchemy import select, func

async def check():
    async with AsyncSessionLocal() as s:
        r1 = await s.execute(select(func.count(Career.career_id)))
        print(f"Total Careers: {r1.scalar()}")

        r2 = await s.execute(select(Career.career_id, Career.title, Career.slug, Career.category, Career.avg_salary_min, Career.avg_salary_max, Career.demand_score, Career.growth_rate_pct))
        for row in r2.all():
            print(f"  {row}")

        r3 = await s.execute(select(func.count(CareerSkill.id)))
        print(f"\nTotal CareerSkills: {r3.scalar()}")

        r4 = await s.execute(
            select(CareerSkill.career_id, Skill.skill_name, CareerSkill.importance, CareerSkill.min_proficiency, CareerSkill.weightage)
            .join(Skill, CareerSkill.skill_id == Skill.skill_id)
        )
        for row in r4.all():
            print(f"  {row}")

        r5 = await s.execute(select(func.count(CareerRecommendation.rec_id)))
        print(f"\nTotal CareerRecommendations: {r5.scalar()}")

        r6 = await s.execute(select(func.count(UserSkill.user_skill_id)))
        print(f"Total UserSkills: {r6.scalar()}")

        r7 = await s.execute(
            select(UserSkill.user_skill_id, UserSkill.user_id, Skill.skill_name, UserSkill.proficiency_level, UserSkill.years_of_experience)
            .join(Skill, UserSkill.skill_id == Skill.skill_id)
            .limit(30)
        )
        for row in r7.all():
            print(f"  {row}")

        r8 = await s.execute(select(func.count(Skill.skill_id)))
        print(f"\nTotal Skills: {r8.scalar()}")

        r9 = await s.execute(select(Skill.skill_id, Skill.skill_name, Skill.category, Skill.domain))
        for row in r9.all():
            print(f"  {row}")

asyncio.run(check())
