import heapq
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.models import Career, CareerSkill, Skill, UserSkill

logger = logging.getLogger("career_service")

class CareerService:
    r"""
    Career Path Orchestrator.
    Deploys Dijkstra's Shortest Path Tree Algorithm ($O((V+E) \log V)$ using Min-Heaps)
    to calculate the optimal skill acquisition pathway from a user's current skillset
    to a target career role.
    """
    
    @staticmethod
    async def get_transition_path(
        start_skills: List[int],
        target_career_id: int,
        db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """
        Computes the shortest path of skill acquisitions to reach a career.
        Edges represent skill prerequisite dependencies; weights represent difficulty.
        """
        # 1. Fetch all required skills for target career
        stmt_cs = select(CareerSkill, Skill).join(Skill, CareerSkill.skill_id == Skill.skill_id).where(
            CareerSkill.career_id == target_career_id
        )
        res_cs = await db.execute(stmt_cs)
        career_skills = res_cs.all()
        
        if not career_skills:
            return []
            
        all_skill_ids = [cs.skill_id for cs, _ in career_skills]
        skills_map = {skill.skill_id: skill for _, skill in career_skills}
        
        # 2. Build graph representing prerequisite connections
        # Vertices (V) = Required Skills; Edges (E) = prerequisite parent to child links
        adj: Dict[int, List[Tuple[int, float]]] = {sid: [] for sid in all_skill_ids}
        
        for cs, skill in career_skills:
            if skill.parent_skill_id and skill.parent_skill_id in adj:
                # Edge weight represents difficulty: must_have=1.0, good_to_have=2.0, optional=3.0
                weight = 1.0 if cs.importance == "must_have" else (2.0 if cs.importance == "good_to_have" else 3.0)
                # Directed edge from parent skill to child skill
                adj[skill.parent_skill_id].append((skill.skill_id, weight))
                
        # Dijkstra's Algorithm initialization
        # Min-Heap format: (cumulative_distance, node_id)
        heap: List[Tuple[float, int]] = []
        distances: Dict[int, float] = {sid: float("inf") for sid in all_skill_ids}
        previous: Dict[int, int] = {sid: -1 for sid in all_skill_ids}
        
        # Start points are skills user already possesses (cost is 0), or root skills (in-degree is 0)
        start_nodes = [sid for sid in all_skill_ids if sid in start_skills]
        if not start_nodes:
            # If user has no skills matching career required, pick skill vertices with no parent prerequisites
            start_nodes = [cs.skill_id for cs, skill in career_skills if not skill.parent_skill_id]
            
        for snode in start_nodes:
            if snode in distances:
                distances[snode] = 0.0
                heapq.heappush(heap, (0.0, snode))
                
        # Dijkstra Execution
        while heap:
            curr_dist, u = heapq.heappop(heap)
            
            if curr_dist > distances[u]:
                continue
                
            for v, weight in adj[u]:
                # Relax Edge (u, v)
                new_dist = curr_dist + weight
                if new_dist < distances[v]:
                    distances[v] = new_dist
                    previous[v] = u
                    heapq.heappush(heap, (new_dist, v))
                    
        # 3. Assemble topological transition pathway
        acquisition_path = []
        # Sort skills by calculated distances (easiest/first acquisitions appear first)
        sorted_sids = sorted(all_skill_ids, key=lambda x: distances[x])
        
        for sid in sorted_sids:
            skill = skills_map[sid]
            acquisition_path.append({
                "skill_id": sid,
                "skill_name": skill.skill_name,
                "acquisition_difficulty_cost": float("inf") if distances[sid] == float("inf") else round(distances[sid], 2),
                "recommended_order": "prerequisite" if previous[sid] != -1 else "foundational"
            })
            
        logger.info(f"Dijkstra's shortest skill pathway completed for career ID: {target_career_id}")
        return acquisition_path

career_service = CareerService()
