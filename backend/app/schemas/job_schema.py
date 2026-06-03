import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class JobResponse(BaseModel):
    job_id: int
    title: str
    company_name: str
    location_city: Optional[str] = None
    work_mode: str
    experience_min_months: int
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    source: str
    posting_date: datetime.date

    class Config:
        from_attributes = True

class JobListing(BaseModel):
    title: str
    company_name: str
    description_raw: str
    required_skills: List[str]

class JobMatch(BaseModel):
    job_id: int
    title: str
    company_name: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]

class JobMatchResponse(BaseModel):
    job: JobResponse
    match_score: float

class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None
