from typing import List, Optional
from sqlalchemy import select, func, over
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Assessment, AssessmentResult

class AssessmentRepository:
    """
    Assessment Repository managing adaptive quizzes and score percentile window functions.
    AI Prompt Role: Assessment analyzer AI.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_assessment_by_id(self, assessment_id: int) -> Optional[Assessment]:
        result = await self.db.execute(select(Assessment).where(Assessment.assessment_id == assessment_id))
        return result.scalars().first()

    async def save_result(self, result: AssessmentResult) -> AssessmentResult:
        self.db.add(result)
        await self.db.flush()
        return result

    async def calculate_percentile(self, score: float, assessment_id: int) -> float:
        """
        Calculate user score percentile rank using a standard ranking aggregate.
        Formula: (Count of scores below / Total count) * 100
        """
        # Count total scores
        total_stmt = select(func.count(AssessmentResult.result_id)).where(
            AssessmentResult.assessment_id == assessment_id
        )
        total_res = await self.db.execute(total_stmt)
        total_count = total_res.scalar() or 0

        if total_count <= 1:
            return 100.0

        # Count scores strictly below current score
        below_stmt = select(func.count(AssessmentResult.result_id)).where(
            AssessmentResult.assessment_id == assessment_id,
            AssessmentResult.score < score
        )
        below_res = await self.db.execute(below_stmt)
        below_count = below_res.scalar() or 0

        percentile = (below_count / total_count) * 100.0
        return round(percentile, 2)

    async def get_user_results(self, user_id: int) -> List[AssessmentResult]:
        stmt = select(AssessmentResult).where(AssessmentResult.user_id == user_id).order_by(AssessmentResult.completed_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
