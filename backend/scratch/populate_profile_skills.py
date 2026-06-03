import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "mysql+aiomysql://root:@localhost:3306/careerai"

async def populate():
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.connect() as conn:
            # 1. Fetch user IDs
            res = await conn.execute(text("SELECT user_id, email FROM users"))
            users = res.fetchall()
            print(f"Found users in DB: {users}")
            
            for u in users:
                uid, email = u[0], u[1]
                print(f"\nProcessing user: {email} (ID: {uid})")
                
                # Check and populate profile
                profile_check = await conn.execute(
                    text("SELECT profile_id FROM user_profiles WHERE user_id = :uid"),
                    {"uid": uid}
                )
                existing_profile = profile_check.fetchone()
                
                if not existing_profile:
                    print("No profile found. Creating User Profile...")
                    await conn.execute(
                        text("""
                            INSERT INTO user_profiles (
                                user_id, education_level, field_of_study, institution_name, 
                                graduation_year, city, state, career_interests, preferred_work_mode, 
                                expected_salary_min, linkedin_url, github_url
                            ) VALUES (
                                :uid, 'btech', 'Computer Science & Engineering', 'Indian Institute of Technology', 
                                2026, 'Bengaluru', 'Karnataka', '{"roles": ["Android Developer", "Software Engineer"]}', 'hybrid', 
                                12, 'https://linkedin.com/in/eswar', 'https://github.com/eswar'
                            )
                        """),
                        {"uid": uid}
                    )
                else:
                    print("Profile already exists. Updating details...")
                    await conn.execute(
                        text("""
                            UPDATE user_profiles SET 
                                education_level = 'btech',
                                field_of_study = 'Computer Science & Engineering',
                                city = 'Bengaluru',
                                preferred_work_mode = 'hybrid',
                                expected_salary_min = 12
                            WHERE user_id = :uid
                        """),
                        {"uid": uid}
                    )
                
                # Check and populate skills
                print("Checking and populating skills...")
                # Fetch available skill IDs
                skills_res = await conn.execute(text("SELECT skill_id, skill_name FROM skills"))
                skills_list = skills_res.fetchall()
                
                for skill in skills_list:
                    skill_id, skill_name = skill[0], skill[1]
                    
                    # Check if user already has this skill
                    user_skill_check = await conn.execute(
                        text("SELECT user_skill_id FROM user_skills WHERE user_id = :uid AND skill_id = :sid"),
                        {"uid": uid, "sid": skill_id}
                    )
                    existing_user_skill = user_skill_check.fetchone()
                    
                    if not existing_user_skill:
                        # Add different proficiency levels based on skill
                        pref = "expert" if skill_name in ["Kotlin", "SQL", "Git"] else "advanced"
                        exp = 3.0 if pref == "expert" else 1.5
                        
                        await conn.execute(
                            text("""
                                INSERT INTO user_skills (
                                    user_id, skill_id, proficiency_level, proficiency_score, 
                                    years_of_experience, is_verified, endorsed_by_count, source
                                ) VALUES (
                                    :uid, :sid, :pref, 85.0, :exp, 1, 3, 'self'
                                )
                            """),
                            {"uid": uid, "sid": skill_id, "pref": pref, "exp": exp}
                        )
                        print(f"Added skill: {skill_name} ({pref})")
            
            await conn.commit()
            print("\nDatabase tables user_profiles and user_skills populated successfully!")
            
    except Exception as e:
        print(f"Error occurred during population: {e}")

if __name__ == "__main__":
    asyncio.run(populate())
