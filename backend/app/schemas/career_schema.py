from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class CareerBase(BaseModel):
    title: str
    category: str
    description: str

class CareerResponse(BaseModel):
    career_id: int
    title: str
    slug: str
    category: str
    description: str
    avg_salary_min: Optional[int] = None
    avg_salary_max: Optional[int] = None
    growth_rate_pct: Optional[float] = None
    demand_score: float
    difficulty_level: str
    time_to_job_ready_months: int

    class Config:
        from_attributes = True

class CareerRecommendationResponse(BaseModel):
    rec_id: int
    career_id: int
    title: str
    fit_score: float
    rank: int
    reasoning_json: Dict[str, Any]
    gap_skills_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class CareerPath(BaseModel):
    start_role: str
    target_role: str
    transition_steps: List[str]
    total_difficulty: float
