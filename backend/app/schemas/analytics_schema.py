from typing import List, Dict, Any
from pydantic import BaseModel

class ProgressMetric(BaseModel):
    metric_name: str
    current_value: float
    target_value: float
    percentage_complete: float

class HeatmapData(BaseModel):
    x_axis_label: str
    y_axis_label: str
    intensity: float

class DashboardData(BaseModel):
    user_id: int
    overall_progress: float
    completed_milestones: int
    active_roadmaps_count: int
    verified_skills_count: int
    skills_progress: List[ProgressMetric]
    career_interest_heatmap: List[HeatmapData]
