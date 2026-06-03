import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.models.chat import ChatSession, ChatMessage
from sqlalchemy.future import select

async def check_database():
    async with AsyncSessionLocal() as db:
        sessions_stmt = select(ChatSession)
        res_sessions = await db.execute(sessions_stmt)
        sessions = res_sessions.scalars().all()
        print(f"Total Chat Sessions in DB: {len(sessions)}")
        for s in sessions:
            print(f"Session {s.session_id} - User {s.user_id} - {s.title}")
            
        messages_stmt = select(ChatMessage)
        res_messages = await db.execute(messages_stmt)
        messages = res_messages.scalars().all()
        print(f"\nTotal Chat Messages in DB: {len(messages)}")
        for m in messages:
            print(f"Message {m.message_id} - Session {m.session_id} - IsUser {m.is_user} - {m.message_text[:50]}")

if __name__ == "__main__":
    asyncio.run(check_database())
