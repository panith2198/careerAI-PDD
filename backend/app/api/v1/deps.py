from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to retrieve the currently authenticated user from the database."""
    print(f"[DEBUG AUTH] Entering get_current_user. Token length: {len(token) if token else 0}")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate login credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Print token for debug
        print(f"[DEBUG AUTH] Received Token: {token[:15]}... [Length: {len(token)}]")
        
        # Decode HMAC-SHA256 signed token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            print("[DEBUG AUTH] Sub claim missing in JWT token")
            raise credentials_exception
        token_data = TokenData(user_id=int(user_id))
    except (jwt.PyJWTError, ValidationError, ValueError) as e:
        print(f"[DEBUG AUTH] JWT Decode/Validation Error: {e}")
        raise credentials_exception
        
    # Fetch user from DB using the decoded integer ID
    stmt = select(User).where(User.user_id == token_data.user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This account has been deactivated."
        )
        
    return user
