import asyncio
import sys
sys.path.append("e:/CareerAI/backend")

from app.core.database import engine
from sqlalchemy import text

async def main():
    print("Connecting to database to alter bookings table status column...")
    try:
        async with engine.begin() as conn:
            # Execute alter query to add completed to the Enum using text()
            await conn.execute(text("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'failed', 'refunded', 'completed') NOT NULL DEFAULT 'pending';"))
        print("Success! Altered column status to support 'completed'.")
    except Exception as e:
        print("Error altering table:", e)

if __name__ == "__main__":
    asyncio.run(main())
