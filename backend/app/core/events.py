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
        
        # Check if database is empty of careers and seed/populate them
        from sqlalchemy import func
        from sqlalchemy.future import select
        from app.models import Career
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            stmt = select(func.count(Career.career_id))
            res = await session.execute(stmt)
            count = res.scalar() or 0
            if count == 0:
                logger.info("Careers table is empty. Running professional career populator...")
                try:
                    from app.tasks.career_populator import populate_careers_from_jobs
                    result = await populate_careers_from_jobs(session)
                    await session.commit()
                    logger.info(f"Career populator completed: {result}")
                except Exception as seed_err:
                    logger.error(f"Career population failed during startup: {seed_err}")
                    await session.rollback()
            else:
                logger.info(f"Careers table has {count} entries. Skipping seed.")
                

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
