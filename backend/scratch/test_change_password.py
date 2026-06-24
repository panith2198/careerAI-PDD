import asyncio
import sys
import os

# Adjust path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from app.models import User
from app.core.security import verify_password, get_password_hash

async def run_test():
    user_id = 5
    current_password = "password" # Let's check what the user's password is
    new_password = "newpassword"
    
    print("==================================================")
    print("      Testing Password Change Logic DB")
    print("==================================================")

    async with AsyncSessionLocal() as session:
        stmt = select(User).where(User.user_id == user_id)
        res = await session.execute(stmt)
        user = res.scalar_one_or_none()
        
        assert user is not None, "User not found!"
        print(f"[PASS] User Eswar found in DB. ID: {user.user_id}")
        
        # Save old hash to restore later
        old_hash = user.password_hash
        
        # Simulate endpoint change password logic
        user.password_hash = get_password_hash(new_password)
        await session.commit()
        print("[PASS] Password hash updated to new password hash in DB.")
        
    # Verify new password is correct
    async with AsyncSessionLocal() as session:
        stmt = select(User).where(User.user_id == user_id)
        res = await session.execute(stmt)
        user = res.scalar_one_or_none()
        assert verify_password(new_password, user.password_hash), "Failed: New password does not verify"
        print("[PASS] Successfully verified new password hash in DB.")
        
        # Restore old password hash so we don't mess up user's active session
        user.password_hash = old_hash
        await session.commit()
        print("[PASS] Restored original password hash in DB.")

    print("\n[SUCCESS] Password change DB test passed perfectly!")

if __name__ == "__main__":
    asyncio.run(run_test())
