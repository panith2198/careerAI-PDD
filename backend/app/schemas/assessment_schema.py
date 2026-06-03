import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class AssessmentResponse(BaseModel):
    assessment_id: int
    title: str
    type: str
    difficulty: str
    total_questions: int
    time_limit_minutes: int

    class Config:
        from_attributes = True

class QuizSubmit(BaseModel):
    assessment_id: int
    answers_json: Dict[str, Any]
    time_taken_seconds: int

AssessmentSubmitRequest = QuizSubmit

class AssessmentResultResponse(BaseModel):
    result_id: int
    score: float
    percentile_rank: Optional[float] = None
    time_taken_seconds: int
    ai_feedback: Optional[str] = None
    gap_analysis_json: Optional[Dict[str, Any]] = None
    attempt_number: int
    completed_at: datetime.datetime

    class Config:
        from_attributes = True

class GapReport(BaseModel):
    missing_skills: List[str]
    priority_scores: Dict[str, float]
    business_impact: Dict[str, str]
