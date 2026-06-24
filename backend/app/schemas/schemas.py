from app.schemas.user_schema import (
    Token, TokenData, LoginRequest, UserCreate, UserResponse,
    UserProfileUpdate, UserProfileResponse, UserSkillDeclaration, UserSkillResponse
)
from app.schemas.career_schema import (
    CareerBase, CareerResponse, CareerRecommendationResponse, CareerPath
)
from app.schemas.assessment_schema import (
    AssessmentResponse, QuizSubmit, AssessmentSubmitRequest, AssessmentResultResponse, GapReport
)
from app.schemas.roadmap_schema import (
    ResourceLink, MilestoneUpdate, RoadmapCreate, RoadmapCreateRequest, RoadmapResponse
)
from app.schemas.job_schema import (
    JobResponse, JobListing, JobMatch, JobMatchResponse, ApplicationCreate
)
from app.schemas.ai_schema import (
    AIRequest, AIResponse, EmbeddingRequest, RagQueryRequest, RagQueryResponse
)
from app.schemas.analytics_schema import (
    ProgressMetric, HeatmapData, DashboardData
)
