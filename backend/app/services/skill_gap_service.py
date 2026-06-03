import heapq
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.models import UserSkill, CareerSkill, Skill

logger = logging.getLogger("skill_gap_service")

class SkillGapService:
    """
    Skill Gap Analyst.
    Runs set differences ($O(n)$ complexity) to isolate missing competencies
    and prioritizes them using a Max-Heap array based on market demand scores.
    """
    
    @staticmethod
    async def analyze_skill_gaps(
        user_id: int,
        career_id: int,
        db: AsyncSession,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """Prioritize missing career skills using a Max-Heap of market scores."""
        # 1. Fetch user declared skill IDs
        stmt_us = select(UserSkill.skill_id).where(UserSkill.user_id == user_id)
        res_us = await db.execute(stmt_us)
        user_skill_ids = set(res_us.scalars().all())
        
        # 2. Fetch required skills for target career
        stmt_cs = select(CareerSkill, Skill).join(Skill, CareerSkill.skill_id == Skill.skill_id).where(
            CareerSkill.career_id == career_id
        )
        res_cs = await db.execute(stmt_cs)
        career_skills = res_cs.all()
        
        # Set Difference: Required - User = Gaps
        gaps = []
        matching_count = 0
        
        # Max-Heap container (heapq in python is Min-Heap, so we push negative scores)
        max_heap = []
        
        for cs, skill in career_skills:
            if cs.skill_id in user_skill_ids:
                matching_count += 1
            else:
                # Skill is missing: push onto Max-Heap based on market demand score
                demand_score = float(skill.market_demand_score)
                # Max-Heap simulation: negate the key
                heapq.heappush(max_heap, (-demand_score, {
                    "skill_id": skill.skill_id,
                    "skill_name": skill.skill_name,
                    "market_demand_score": demand_score,
                    "importance": cs.importance,
                    "min_proficiency": cs.min_proficiency
                }))
                
        # 3. Extract prioritized top-k gaps from Max-Heap
        prioritized_gaps = []
        while max_heap and len(prioritized_gaps) < top_k:
            neg_score, item = heapq.heappop(max_heap)
            prioritized_gaps.append(item)
            
        total_required = len(career_skills)
        compatibility_score = (matching_count / total_required * 100.0) if total_required > 0 else 100.0
        
        logger.info(f"Skill gap prioritization completed. isolated {len(prioritized_gaps)} priority gaps.")
        return {
            "user_id": user_id,
            "career_id": career_id,
            "compatibility_score": round(compatibility_score, 2),
            "total_required_count": total_required,
            "user_matched_count": matching_count,
            "prioritized_gaps": prioritized_gaps
        }

skill_gap_service = SkillGapService()
