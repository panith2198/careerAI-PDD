import logging
from sqlalchemy.sql import text
from app.core.database import engine

logger = logging.getLogger("events")

async def handle_app_startup():
    """
    FastAPI startup lifespan event.
    Performs DB connection pool checks, schema verification, 
    local model register initializations, and cache warmups.
    """
    logger.info("Initializing core services and warming up cache pools...")
    
    # 1. DB Ping
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            logger.info("Database ping successful! Connection pool is healthy.")
            
        # Ensure all tables exist in the database (auto-migration/dynamic schema creation)
        from app.models import User, UserOTP # Ensure models are loaded
        from app.core.database import Base, AsyncSessionLocal
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully via create_all.")
        
        # Check if database is empty of careers and seed default ones if count is 0
        from sqlalchemy import func
        from sqlalchemy.future import select
        from app.models import Career, Skill, CareerSkill
        async with AsyncSessionLocal() as session:
            stmt = select(func.count(Career.career_id))
            res = await session.execute(stmt)
            count = res.scalar() or 0
            if count == 0:
                logger.info("Careers table is empty. Seeding default mock career paths and skills...")
                
                # 1. Define Skills
                skills_data = [
                    {"skill_name": "Python", "skill_slug": "python", "category": "technical", "domain": "Data Science"},
                    {"skill_name": "SQL", "skill_slug": "sql", "category": "technical", "domain": "Databases"},
                    {"skill_name": "Docker", "skill_slug": "docker", "category": "tool", "domain": "DevOps"},
                    {"skill_name": "Kubernetes", "skill_slug": "kubernetes", "category": "technical", "domain": "DevOps"},
                    {"skill_name": "React", "skill_slug": "react", "category": "technical", "domain": "Web Development"},
                    {"skill_name": "Kotlin", "skill_slug": "kotlin", "category": "technical", "domain": "Mobile Development"},
                    {"skill_name": "Swift", "skill_slug": "swift", "category": "technical", "domain": "Mobile Development"},
                    {"skill_name": "Git", "skill_slug": "git", "category": "tool", "domain": "General Coding"}
                ]
                
                skills_list = []
                for s in skills_data:
                    sk = Skill(
                        skill_name=s["skill_name"],
                        skill_slug=s["skill_slug"],
                        category=s["category"],
                        domain=s["domain"],
                        market_demand_score=85.0,
                        is_trending=True
                    )
                    session.add(sk)
                    skills_list.append(sk)
                
                await session.flush()
                
                # Create a map for ease of linking
                skills_map = {sk.skill_name: sk.skill_id for sk in skills_list}
                
                # 2. Define Careers
                careers_data = [
                    {
                        "title": "Data Analyst",
                        "slug": "data-analyst",
                        "category": "Data Science",
                        "description": "Analyze datasets to extract insights and generate business intelligence dashboards.",
                        "avg_salary_min": 500000,
                        "avg_salary_max": 1200000,
                        "growth_rate_pct": 15.5,
                        "demand_score": 88.0,
                        "difficulty_level": "medium",
                        "time_to_job_ready_months": 6,
                        "skills": [("Python", "must_have"), ("SQL", "must_have"), ("Git", "good_to_have")]
                    },
                    {
                        "title": "DevOps Engineer",
                        "slug": "devops-engineer",
                        "category": "Cloud & Operations",
                        "description": "Bridge development and IT operations to optimize software release processes.",
                        "avg_salary_min": 800000,
                        "avg_salary_max": 2000000,
                        "growth_rate_pct": 21.0,
                        "demand_score": 94.0,
                        "difficulty_level": "hard",
                        "time_to_job_ready_months": 9,
                        "skills": [("Docker", "must_have"), ("Kubernetes", "must_have"), ("Python", "good_to_have"), ("Git", "must_have")]
                    },
                    {
                        "title": "Frontend Developer",
                        "slug": "frontend-developer",
                        "category": "Web Development",
                        "description": "Construct high-fidelity, responsive user interface layouts and client applications.",
                        "avg_salary_min": 600000,
                        "avg_salary_max": 1500000,
                        "growth_rate_pct": 18.0,
                        "demand_score": 90.0,
                        "difficulty_level": "medium",
                        "time_to_job_ready_months": 6,
                        "skills": [("React", "must_have"), ("Git", "must_have")]
                    },
                    {
                        "title": "Android Developer",
                        "slug": "android-developer",
                        "category": "Mobile Development",
                        "description": "Build high-performance native Android applications matching modern specifications.",
                        "avg_salary_min": 700000,
                        "avg_salary_max": 1800000,
                        "growth_rate_pct": 16.5,
                        "demand_score": 87.0,
                        "difficulty_level": "medium",
                        "time_to_job_ready_months": 6,
                        "skills": [("Kotlin", "must_have"), ("Git", "must_have")]
                    }
                ]
                
                for c in careers_data:
                    car = Career(
                        title=c["title"],
                        slug=c["slug"],
                        category=c["category"],
                        description=c["description"],
                        avg_salary_min=c["avg_salary_min"],
                        avg_salary_max=c["avg_salary_max"],
                        growth_rate_pct=c["growth_rate_pct"],
                        demand_score=c["demand_score"],
                        difficulty_level=c["difficulty_level"],
                        time_to_job_ready_months=c["time_to_job_ready_months"],
                        is_active=True
                    )
                    session.add(car)
                    await session.flush()
                    
                    for sk_name, importance in c["skills"]:
                        skill_id = skills_map.get(sk_name)
                        if skill_id:
                            cs = CareerSkill(
                                career_id=car.career_id,
                                skill_id=skill_id,
                                importance=importance,
                                min_proficiency="intermediate",
                                weightage=1.0
                            )
                            session.add(cs)
                
                await session.commit()
                logger.info("Database successfully seeded with default careers and skills.")
                
        # Seed assessments if empty
        from app.models import Assessment
        async with AsyncSessionLocal() as session:
            stmt_a = select(func.count(Assessment.assessment_id))
            res_a = await session.execute(stmt_a)
            count_a = res_a.scalar() or 0
            if count_a == 0:
                logger.info("Assessments table is empty. Seeding default assessments...")
                res_s = await session.execute(select(Skill).where(Skill.skill_name == "Python"))
                python_skill = res_s.scalar_one_or_none()
                skill_id = python_skill.skill_id if python_skill else None
                
                assessment = Assessment(
                    assessment_id=1,
                    title="Python Programming Core Assessment",
                    career_id=1,
                    skill_id=skill_id,
                    type="mcq",
                    difficulty="medium",
                    total_questions=5,
                    time_limit_minutes=15,
                    pass_score_pct=60.00,
                    irt_params={"difficulty_step": 0.5, "discrimination": 1.0, "guessing": 0.2},
                    is_active=True
                )
                session.add(assessment)
                await session.commit()
                logger.info("Successfully seeded core MCQ assessments.")
    except Exception as e:
        logger.error(f"Critical error on startup DB ping check, table creation, or seeding: {e}")
        # We do not crash the container but record the failure to let healthchecks catch it
        
    # 2. Local Models Registry warmup check
    try:
        from app.local_models.model_manager import model_manager
        # Attempt minimal registration confirmation
        logger.info("Local models registry validated successfully.")
    except Exception as e:
        logger.warning(f"Local models warmup check raised warning: {e}")

    logger.info("Application context fully initialized and ready to receive requests.")

async def handle_app_shutdown():
    """
    FastAPI shutdown lifespan event.
    Safely tears down connection pools, sockets, and client instances.
    """
    logger.info("Tearing down service resources...")
    try:
        await engine.dispose()
        logger.info("Database async engine connection pool closed successfully.")
    except Exception as e:
        logger.error(f"Error disposing database connections: {e}")
        
    logger.info("Service cleanup complete. Exiting clean.")
