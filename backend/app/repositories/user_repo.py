import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, UserProfile

class UserRepository:
    """
    Asynchronous Repository for User Entities.
    AI Prompt Role: User profile extractor.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.user_id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_phone(self, phone: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.phone == phone))
        return result.scalars().first()

    async def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user with generated UUID."""
        user = User(
            uuid=str(uuid.uuid4()),
            email=user_data["email"],
            phone=user_data.get("phone"),
            password_hash=user_data["password_hash"],
            full_name=user_data["full_name"],
            role=user_data.get("role", "student"),
            subscription_tier=user_data.get("subscription_tier", "free"),
            mistral_token_budget=user_data.get("mistral_token_budget", 10000),
            is_verified=user_data.get("is_verified", False),
            is_active=True
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def upsert_profile(self, user_id: int, profile_data: Dict[str, Any]) -> UserProfile:
        """Upsert user profile linked 1:1 with user_id."""
        result = await self.db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = result.scalars().first()

        if not profile:
            profile = UserProfile(user_id=user_id)
            self.db.add(profile)

        # Update properties
        for key, val in profile_data.items():
            if hasattr(profile, key):
                setattr(profile, key, val)

        await self.db.flush()
        return profile

    async def bulk_import_users(self, users_list: List[Dict[str, Any]]) -> List[User]:
        """Perform optimized batch insertions for importing multiple users."""
        imported_users = []
        for u_data in users_list:
            user = User(
                uuid=str(uuid.uuid4()),
                email=u_data["email"],
                phone=u_data.get("phone"),
                password_hash=u_data["password_hash"],
                full_name=u_data["full_name"],
                role=u_data.get("role", "student"),
                is_verified=u_data.get("is_verified", False),
                is_active=True
            )
            self.db.add(user)
            imported_users.append(user)
        await self.db.flush()
        return imported_users
