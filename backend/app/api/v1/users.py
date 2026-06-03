import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, UserProfile, Skill, UserSkill
from app.schemas import UserResponse, UserProfileResponse

router = APIRouter()

# Schema definitions for User endpoints
class UserMeUpdatePayload(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    preferred_work_mode: Optional[str] = None
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    institution_name: Optional[str] = None
    graduation_year: Optional[int] = None
    expected_salary_min: Optional[int] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None

class UserSkillAddPayload(BaseModel):
    skill_id: int
    proficiency_level: str = Field(..., description="beginner, intermediate, advanced, expert")
    years_experience: Optional[float] = Field(default=0.0, ge=0.0)

@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch current user profile, preferences, and declared skillsets."""
    # Load profile details
    profile_stmt = select(UserProfile).where(UserProfile.user_id == current_user.user_id)
    profile_res = await db.execute(profile_stmt)
    profile = profile_res.scalar_one_or_none()

    # Load skill mappings
    skills_stmt = (
        select(UserSkill, Skill)
        .join(Skill, UserSkill.skill_id == Skill.skill_id)
        .where(UserSkill.user_id == current_user.user_id)
    )
    skills_res = await db.execute(skills_stmt)
    skills_list = []
    for user_skill, skill in skills_res.all():
        skills_list.append({
            "user_skill_id": user_skill.user_skill_id,
            "skill_id": skill.skill_id,
            "skill_name": skill.skill_name,
            "proficiency_level": user_skill.proficiency_level,
            "years_of_experience": float(user_skill.years_of_experience)
        })

    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "subscription_tier": current_user.subscription_tier,
        "profile": {
            "city": profile.city if profile else None,
            "state": profile.state if profile else None,
            "preferred_work_mode": profile.preferred_work_mode if profile else None,
            "education_level": profile.education_level if profile else None,
            "expected_salary_min": profile.expected_salary_min if profile else None,
            "field_of_study": profile.field_of_study if profile else None,
            "institution_name": profile.institution_name if profile else None,
            "graduation_year": profile.graduation_year if profile else None,
            "linkedin_url": profile.linkedin_url if profile else None,
            "github_url": profile.github_url if profile else None
        } if profile else None,
        "skills": skills_list
    }

@router.put("/me")
async def update_me(
    payload: UserMeUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update active user full name and profile details."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
        
    # Get or create UserProfile
    profile_stmt = select(UserProfile).where(UserProfile.user_id == current_user.user_id)
    profile_res = await db.execute(profile_stmt)
    profile = profile_res.scalar_one_or_none()
    
    if not profile:
        profile = UserProfile(
            user_id=current_user.user_id,
            education_level="btech",  # Default baseline
            field_of_study="Unspecified",
            institution_name="Unspecified",
            graduation_year=2024
        )
        db.add(profile)
        
    if payload.city is not None:
        profile.city = payload.city
    if payload.state is not None:
        profile.state = payload.state
    if payload.preferred_work_mode is not None:
        work_mode = payload.preferred_work_mode.lower()
        if work_mode in ["remote", "onsite", "hybrid"]:
            profile.preferred_work_mode = work_mode
    if payload.education_level is not None:
        edu = payload.education_level.lower()
        if edu in ["12th", "diploma", "btech", "mtech", "mba", "phd"]:
            profile.education_level = edu
    if payload.field_of_study is not None:
        profile.field_of_study = payload.field_of_study
    if payload.institution_name is not None:
        profile.institution_name = payload.institution_name
    if payload.graduation_year is not None:
        profile.graduation_year = payload.graduation_year
    if payload.expected_salary_min is not None:
        profile.expected_salary_min = payload.expected_salary_min
    if payload.linkedin_url is not None:
        profile.linkedin_url = payload.linkedin_url
    if payload.github_url is not None:
        profile.github_url = payload.github_url
            
    await db.flush()
    return {"message": "Profile updated successfully."}

@router.post("/me/skills", status_code=status.HTTP_201_CREATED)
async def add_user_skill(
    payload: UserSkillAddPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a skill to the user's profile. Returns 409 if already present."""
    # 1. Verify skill exists in taxonomy
    skill_stmt = select(Skill).where(Skill.skill_id == payload.skill_id)
    skill_res = await db.execute(skill_stmt)
    skill = skill_res.scalar_one_or_none()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill ID does not exist in standard taxonomy."
        )

    # 2. Check if mapping already exists
    existing_stmt = select(UserSkill).where(
        UserSkill.user_id == current_user.user_id,
        UserSkill.skill_id == payload.skill_id
    )
    existing_res = await db.execute(existing_stmt)
    existing = existing_res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This skill has already been added to your profile."
        )

    proficiency = payload.proficiency_level.lower()
    if proficiency not in ["beginner", "intermediate", "advanced", "expert"]:
        proficiency = "beginner"

    new_mapping = UserSkill(
        user_id=current_user.user_id,
        skill_id=payload.skill_id,
        proficiency_level=proficiency,
        years_of_experience=payload.years_experience or 0.0,
        source="self"
    )
    db.add(new_mapping)
    await db.flush()
    
    return {"user_skill_id": new_mapping.user_skill_id}

@router.delete("/me/skills/{user_skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_skill(
    user_skill_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a skill mapping from user profile."""
    stmt = select(UserSkill).where(
        UserSkill.user_skill_id == user_skill_id,
        UserSkill.user_id == current_user.user_id
    )
    res = await db.execute(stmt)
    record = res.scalar_one_or_none()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill mapping record not found or access denied."
        )
        
    await db.delete(record)
    await db.flush()
    return None

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload profile photos/avatars asynchronously (max size 2MB, JPG/PNG)."""
    # 1. Format validation
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Only JPG/PNG supported."
        )
        
    # 2. File size validation (up to 2MB)
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum 2MB allowance."
        )
        
    # Simulated static path storage return
    avatar_url = f"/static/avatars/user_{current_user.user_id}{ext}"
    return {"avatar_url": avatar_url}
