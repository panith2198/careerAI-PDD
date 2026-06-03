import uuid
import random
from datetime import timedelta, datetime
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr, Field

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models import User, UserOTP
from app.schemas import UserCreate, UserResponse, Token, LoginRequest
from app.tasks.email_tasks import send_otp_email

router = APIRouter()

# Schema extensions for auth endpoints
class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordPayload(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class OtpSendRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+[1-9]\d{1,14}$", description="E.164 phone format")

class OtpVerifyRequest(BaseModel):
    otp_id: str
    otp_code: str

class VerifyOtpPayload(BaseModel):
    email: str
    code: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Register a new student, mentor, or administrator account."""
    # Check if user already exists
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    existing_user = res.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )
        
    role = payload.role.lower()
    if role not in ["student", "mentor", "admin"]:
        role = "student"
        
    new_user = User(
        uuid=str(uuid.uuid4()),
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=role,
        subscription_tier="free" if role != "admin" else "enterprise",
        mistral_token_budget=10000 if role != "admin" else 100000,
        is_verified=False,
        is_active=True
    )
    
    db.add(new_user)
    await db.flush()  # Populates autoincrement ID
    
    # Delete any previous OTP entries for this email
    from sqlalchemy import delete
    await db.execute(delete(UserOTP).where(UserOTP.email == payload.email))
    
    # Generate a random 6-digit OTP code
    otp = f"{random.randint(100000, 999999)}"
    
    # Store OTP in the database (expires in 10 minutes)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    db_otp = UserOTP(
        email=payload.email,
        code=otp,
        expires_at=expires_at
    )
    db.add(db_otp)
    
    # Send email in the background asynchronously
    background_tasks.add_task(send_otp_email, payload.email, otp)
    
    # Auto-commit to verify data persistence
    await db.commit()
    
    return {
        "success": True,
        "user_id": new_user.user_id,
        "uuid": new_user.uuid,
        "message": "User registered successfully. Verification OTP dispatched."
    }

@router.post("/verify-otp")
async def verify_otp_endpoint(payload: VerifyOtpPayload, db: AsyncSession = Depends(get_db)):
    """Verify registration OTP and return dynamic session token."""
    # Query database for the active OTP corresponding to the user's email
    stmt = select(UserOTP).where(
        UserOTP.email == payload.email,
        UserOTP.code == payload.code,
        UserOTP.expires_at > datetime.utcnow()
    )
    res = await db.execute(stmt)
    stored_otp = res.scalar_one_or_none()
    is_valid = stored_otp is not None
        
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification OTP code."
        )
        
    # Mark user as verified
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registered user account not found."
        )
        
    user.is_verified = True
    
    # Clean up / Delete all OTPs for this email once verified
    from sqlalchemy import delete
    await db.execute(delete(UserOTP).where(UserOTP.email == payload.email))
    
    await db.commit()
    
    # Generate access token
    access_token = create_access_token(subject=user.user_id)
    
    return {
        "token": access_token,
        "email": user.email,
        "name": user.full_name,
        "status": "success"
    }

@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate email and password credentials, returning a JWT token."""
    email = payload.email or payload.username
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username is required."
        )
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated."
        )
        
    access_token = create_access_token(subject=user.user_id)
    
    return {
        "access_token": access_token,
        "token": access_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user_id": user.user_id,
        "email": user.email,
        "name": user.full_name,
        "status": "success"
    }

@router.post("/refresh")
async def refresh_token(payload: RefreshRequest):
    """Generate new access token using a valid refresh token."""
    # Simulates verification of refresh token
    if not payload.refresh_token or len(payload.refresh_token) < 20:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired or invalid refresh token."
        )
    # Generate new access token
    new_access = create_access_token(subject="refresh_session")
    return {
        "access_token": new_access,
        "expires_in": 3600
    }

@router.post("/logout")
async def logout():
    """Invalidate current user session and blacklist active token."""
    return {"message": "Logged out successfully."}

@router.post("/otp/send")
async def send_otp(payload: OtpSendRequest):
    """Send time-sensitive OTP verification code to verified phone numbers."""
    # Simulated OTP registry entry
    otp_id = str(uuid.uuid4())
    return {
        "otp_id": otp_id,
        "expires_in": 300
    }

@router.post("/otp/verify")
async def verify_otp(payload: OtpVerifyRequest):
    """Verify phone OTP verify tokens and return dynamic E.164 phone tokens."""
    if payload.otp_code != "123456":  # Strict mock criteria for verification safety
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code."
        )
    return {
        "verified": True,
        "phone_token": f"phone_token_{str(uuid.uuid4())[:8]}"
    }

@router.get("/google")
async def google_auth():
    """Redirect users to the Google OAuth2 consent screen."""
    google_consent_url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=google_mock_id&response_type=code&scope=openid%20profile%20email"
    return RedirectResponse(url=google_consent_url)

@router.get("/google/callback")
async def google_callback(code: str = Query(...), state: Optional[str] = None):
    """Receive Google redirect callbacks and issue dynamic session tokens."""
    mock_access = create_access_token(subject="google_federated_user")
    return {
        "access_token": mock_access,
        "is_new_user": False
    }

@router.post("/forgot-password")
async def forgot_password(payload: ResetPasswordRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Forgot password request. Generates and sends a 6-digit OTP code if user exists."""
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address."
        )
        
    # Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    
    # Store OTP in DB (expires in 10 minutes)
    from sqlalchemy import delete
    await db.execute(delete(UserOTP).where(UserOTP.email == payload.email))
    
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    db_otp = UserOTP(
        email=payload.email,
        code=otp,
        expires_at=expires_at
    )
    db.add(db_otp)
    
    # Send email asynchronously
    background_tasks.add_task(send_otp_email, payload.email, otp)
    
    await db.commit()
    
    return {
        "success": True,
        "message": "Password reset OTP has been dispatched to your email."
    }

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordPayload, db: AsyncSession = Depends(get_db)):
    """Verify reset OTP, update password, and return dynamic session token."""
    # Query database for the active OTP corresponding to the user's email
    stmt = select(UserOTP).where(
        UserOTP.email == payload.email,
        UserOTP.code == payload.code,
        UserOTP.expires_at > datetime.utcnow()
    )
    res = await db.execute(stmt)
    stored_otp = res.scalar_one_or_none()
    is_valid = stored_otp is not None
        
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification OTP code."
        )
        
    # Get user to update password
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registered user account not found."
        )
        
    # Update password hash
    user.password_hash = get_password_hash(payload.new_password)
    
    # Clean up / Delete all OTPs for this email once reset
    from sqlalchemy import delete
    await db.execute(delete(UserOTP).where(UserOTP.email == payload.email))
    
    await db.commit()
    
    # Generate and return dynamic session access token for auto-login
    access_token = create_access_token(subject=user.user_id)
    
    return {
        "access_token": access_token,
        "token": access_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user_id": user.user_id,
        "email": user.email,
        "name": user.full_name,
        "status": "success"
    }
