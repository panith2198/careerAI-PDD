import heapq
import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.models import Career, CareerSkill, Skill, Roadmap

logger = logging.getLogger("roadmap_service")

class RoadmapService:
    """
    DAG-based Learning Path Orchestrator.
    Generates topological milestone learning roadmaps scheduling weekly committed topics
    using priority queue milestones algorithms.
    """
    
    @staticmethod
    async def create_learning_roadmap(
        user_id: int,
        career_id: int,
        total_weeks: int,
        hours_per_week: int,
        db: AsyncSession
    ) -> Roadmap:
        """
        Builds prerequisite DAG and schedules milestones.
        Uses Kahn's Topological Sort with a min-heap priority queue to order skills.
        """
        # 1. Fetch career required skills
        stmt_cs = select(CareerSkill, Skill).join(Skill, CareerSkill.skill_id == Skill.skill_id).where(
            CareerSkill.career_id == career_id
        )
        res_cs = await db.execute(stmt_cs)
        career_skills = res_cs.all()
        
        if not career_skills:
            raise ValueError("No skills mapped to this career role.")
            
        all_skill_ids = [cs.skill_id for cs, _ in career_skills]
        skills_map = {skill.skill_id: skill for _, skill in career_skills}
        importance_map = {cs.skill_id: cs.importance for cs, _ in career_skills}
        
        # 2. Build DAG and in-degree counts
        adj = {sid: [] for sid in all_skill_ids}
        in_degree = {sid: 0 for sid in all_skill_ids}
        
        for _, skill in career_skills:
            if skill.parent_skill_id and skill.parent_skill_id in adj:
                adj[skill.parent_skill_id].append(skill.skill_id)
                in_degree[skill.skill_id] += 1
                
        # 3. Min-Heap Priority Queue Topological Sort
        # Priority order: 0 in-degree nodes first, then prioritize by importance
        # Map importance strings to sorting indices: must_have=1, good_to_have=2, optional=3
        importance_score = {"must_have": 1, "good_to_have": 2, "optional": 3}
        
        # Heap elements: (in_degree, importance_weight, skill_id)
        heap = []
        for sid in all_skill_ids:
            if in_degree[sid] == 0:
                imp = importance_score.get(importance_map[sid], 3)
                heapq.heappush(heap, (0, imp, sid))
                
        sorted_skills = []
        while heap:
            _, _, u = heapq.heappop(heap)
            sorted_skills.append(skills_map[u])
            
            for v in adj[u]:
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    imp = importance_score.get(importance_map[v], 3)
                    heapq.heappush(heap, (0, imp, v))
                    
        # Catch isolated nodes
        for sid in all_skill_ids:
            if skills_map[sid] not in sorted_skills:
                sorted_skills.append(skills_map[sid])
                
        # 4. Schedule weeks
        weeks = total_weeks if total_weeks > 0 else 12
        phase_count = min(3, len(sorted_skills))
        skills_per_phase = max(1, len(sorted_skills) // phase_count) if phase_count > 0 else 1
        
        milestones = []
        for i in range(phase_count):
            phase_skills = sorted_skills[i * skills_per_phase : (i + 1) * skills_per_phase]
            week_start = 1 + i * (weeks // phase_count)
            week_end = (i + 1) * (weeks // phase_count)
            
            milestones.append({
                "phase": f"Phase {i+1}",
                "weeks": f"Weeks {week_start}-{week_end}",
                "topics": [s.skill_name for s in phase_skills],
                "resources": [f"Learn {s.skill_name} on Github and MDN docs" for s in phase_skills]
            })
            
        new_roadmap = Roadmap(
            user_id=user_id,
            career_id=career_id,
            title=f"Roadmap to Job Ready in {weeks} Weeks",
            total_weeks=weeks,
            hours_per_week=hours_per_week,
            status="draft",
            completion_pct=0.00,
            ai_model_used="claude-3-5",
            milestones_json={"phases": milestones}
        )
        
        db.add(new_roadmap)
        await db.flush()
        
        return new_roadmap
        
roadmap_service = RoadmapService()
