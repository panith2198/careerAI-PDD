import asyncio
import sys
import os
import re

# Adjust path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from sqlalchemy import delete, func
from app.models import Skill, UserSkill

async def run_test():
    user_id = 5
    custom_skill_name = "Svelte"
    proficiency_level = "advanced"
    years_experience = 2.5
    
    print("==================================================")
    print("      Testing Manual Skill Addition Logic DB")
    print("==================================================")

    # 1. Clean up existing Svelte skill
    async with AsyncSessionLocal() as session:
        stmt = select(Skill).where(Skill.skill_name == custom_skill_name)
        res = await session.execute(stmt)
        existing_skill = res.scalar_one_or_none()
        if existing_skill:
            await session.execute(delete(UserSkill).where(UserSkill.skill_id == existing_skill.skill_id))
            await session.execute(delete(Skill).where(Skill.skill_id == existing_skill.skill_id))
            await session.commit()
            print("[INFO] Cleaned up pre-existing Svelte skill.")

    # 2. Run manual skill addition simulation
    async with AsyncSessionLocal() as session:
        # Check if custom skill name exists (case-insensitive check)
        clean_name = custom_skill_name.strip()
        skill_stmt = select(Skill).where(func.lower(Skill.skill_name) == func.lower(clean_name))
        skill_res = await session.execute(skill_stmt)
        skill = skill_res.scalar_one_or_none()
        
        if not skill:
            # Create a new skill in taxonomy
            slug = re.sub(r'[^\w\s-]', '', clean_name.lower())
            slug = re.sub(r'[-\s]+', '-', slug).strip('-')
            
            # Ensure slug uniqueness in database
            base_slug = slug
            slug_counter = 1
            while True:
                slug_check_stmt = select(Skill).where(Skill.skill_slug == slug)
                slug_check_res = await session.execute(slug_check_stmt)
                if not slug_check_res.scalar_one_or_none():
                    break
                slug = f"{base_slug}-{slug_counter}"
                slug_counter += 1
                
            skill = Skill(
                skill_name=clean_name,
                skill_slug=slug,
                category="technical",
                domain="General",
                market_demand_score=50.0,
                is_trending=False
            )
            session.add(skill)
            await session.flush() # Obtain skill.skill_id
            print(f"[PASS] Successfully created new Skill in taxonomy. ID: {skill.skill_id}, Name: {skill.skill_name}, Slug: {skill.skill_slug}")

        # Check if user mapping exists
        existing_stmt = select(UserSkill).where(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == skill.skill_id
        )
        existing_res = await session.execute(existing_stmt)
        existing = existing_res.scalar_one_or_none()
        
        assert existing is None, "Expected mapping to not exist yet"
        
        proficiency = proficiency_level.lower()
        if proficiency not in ["beginner", "intermediate", "advanced", "expert"]:
            proficiency = "beginner"

        new_mapping = UserSkill(
            user_id=user_id,
            skill_id=skill.skill_id,
            proficiency_level=proficiency,
            years_of_experience=years_experience,
            source="self"
        )
        session.add(new_mapping)
        await session.commit()
        print(f"[PASS] Successfully linked Skill ID: {skill.skill_id} to User ID: {user_id}")

    # 3. Verify data in DB
    async with AsyncSessionLocal() as session:
        stmt = select(Skill).where(Skill.skill_name == custom_skill_name)
        res = await session.execute(stmt)
        db_skill = res.scalar_one_or_none()
        assert db_skill is not None, "Skill not found after commit"
        
        mapping_stmt = select(UserSkill).where(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == db_skill.skill_id
        )
        mapping_res = await session.execute(mapping_stmt)
        db_mapping = mapping_res.scalar_one_or_none()
        assert db_mapping is not None, "UserSkill mapping not found after commit"
        print(f"[PASS] Verified details in DB: Skill={db_skill.skill_name}, Slug={db_skill.skill_slug}, Level={db_mapping.proficiency_level}, Years={db_mapping.years_of_experience}")

    # 4. Clean up after test
    async with AsyncSessionLocal() as session:
        stmt = select(Skill).where(Skill.skill_name == custom_skill_name)
        res = await session.execute(stmt)
        db_skill = res.scalar_one_or_none()
        if db_skill:
            await session.execute(delete(UserSkill).where(UserSkill.skill_id == db_skill.skill_id))
            await session.execute(delete(Skill).where(Skill.skill_id == db_skill.skill_id))
            await session.commit()
            print("[INFO] Cleaned up Svelte skill after test.")

    print("\n[SUCCESS] Direct DB test for manual skill creation passed perfectly!")

if __name__ == "__main__":
    asyncio.run(run_test())
