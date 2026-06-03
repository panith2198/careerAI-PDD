import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import engine, Base
import app.models  # Registers all models including ChatSession and ChatMessage

async def create_tables():
    print("Connecting to database to create new chat tables...")
    async with engine.begin() as conn:
        # Create tables for ChatSession and ChatMessage if they do not exist
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
