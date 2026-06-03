import heapq
from typing import List, Dict, Tuple, Any

class GapAnalyzerAlg:
    """
    Algorithmic Gap Analyzer.
    Prioritizes missing competencies using a Max-Heap array based on market demand 
    and business impact scoring weights, calculating prioritized learning gaps in $O(n \\log n)$ complexity.
    AI Prompt Role: Gap analysis AI.
    """
    
    @staticmethod
    def identify_and_prioritize_gaps(
        user_skills: List[str],
        required_skills: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Isolate skill gaps and prioritize using Max-Heap sorting with business impact weighting.
        Each required skill is represented as a dictionary: 
            {"name": str, "demand_score": float, "business_impact_weight": float}
        """
        user_skills_set = {s.lower().strip() for s in user_skills}
        max_heap: List[Tuple[float, Dict[str, Any]]] = []

        for req in required_skills:
            name = req["name"]
            if name.lower().strip() not in user_skills_set:
                demand = float(req.get("demand_score", 0.00))
                impact = float(req.get("business_impact_weight", 1.00))
                
                # Priority is impact-weighted demand score
                weighted_priority = demand * impact
                
                # Max-Heap simulation by negating the float key
                heapq.heappush(max_heap, (-weighted_priority, req))

        # Extract prioritized top-k elements
        prioritized = []
        while max_heap and len(prioritized) < top_k:
            neg_priority, item = heapq.heappop(max_heap)
            # Add calculated priority to item metadata
            item_copy = dict(item)
            item_copy["gap_priority_score"] = round(-neg_priority, 2)
            prioritized.append(item_copy)

        return prioritized

