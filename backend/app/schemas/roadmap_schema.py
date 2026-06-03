import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class ResourceLink(BaseModel):
    title: str
    url: str
    type: str

class MilestoneUpdate(BaseModel):
    milestone_id: str
    status: str  # pending, completed, in_progress

class RoadmapCreate(BaseModel):
    career_id: int
    title: str
    total_weeks: int
    hours_per_week: int

RoadmapCreateRequest = RoadmapCreate

class RoadmapResponse(BaseModel):
    roadmap_id: int
    career_id: int
    title: str
    total_weeks: int
    hours_per_week: int
    status: str
    completion_pct: float
    milestones_json: Dict[str, Any]
    generated_at: datetime.datetime

    class Config:
        from_attributes = True
