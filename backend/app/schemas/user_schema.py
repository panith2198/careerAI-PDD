import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: Optional[EmailStr] = None  # Maps to email
    email: Optional[EmailStr] = None     # Maps to email
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1, max_length=120)
    role: str = Field(default="student")

class UserResponse(BaseModel):
    user_id: int
    uuid: str
    email: EmailStr
    full_name: str
    role: str
    subscription_tier: str
    mistral_token_budget: int
    is_verified: bool
    is_active: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    education_level: str
    field_of_study: str
    institution_name: str
    graduation_year: int
    city: Optional[str] = None
    state: Optional[str] = None
    career_interests: Optional[List[str]] = None
    preferred_work_mode: Optional[str] = None
    expected_salary_min: Optional[int] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    resume_url: Optional[str] = None

class UserProfileResponse(BaseModel):
    profile_id: int
    user_id: int
    education_level: str
    field_of_study: str
    institution_name: str
    graduation_year: int
    city: Optional[str]
    state: Optional[str]
    career_interests: Optional[List[str]]
    preferred_work_mode: Optional[str]
    expected_salary_min: Optional[int]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    resume_url: Optional[str]

    class Config:
        from_attributes = True

class UserSkillDeclaration(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    proficiency_level: str = Field(default="beginner") # beginner, intermediate, advanced, expert
    years_of_experience: float = Field(default=0.0, ge=0.0)

class UserSkillResponse(BaseModel):
    user_skill_id: int
    user_id: int
    skill_id: int
    skill_name: str
    proficiency_level: str
    proficiency_score: Optional[float]
    years_of_experience: float
    is_verified: bool
    endorsed_by_count: int
    source: str
    added_at: datetime.datetime

    class Config:
        from_attributes = True

class MentorResponse(BaseModel):
    mentor_id: int
    designation: str
    years_experience: int
    expertise_skills_json: Dict[str, Any]
    hourly_rate_inr: int
    rating_avg: float
    bio: str

    class Config:
        from_attributes = True

