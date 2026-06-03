from typing import List, Dict, Any

class RankingEvaluator:
    """
    Multi-Criteria Ranking Evaluator.
    Employs the Weighted Sum Model (WSM) with min-max normalization
    and the Analytic Hierarchy Process (AHP) method to prioritize matches based on preferences.
    AI Prompt Role: Ranking evaluator AI.
    """
    
    @staticmethod
    def rank_items(
        items: List[Dict[str, Any]],
        criteria_weights: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """
        Rank items (e.g. jobs) over multi-criteria scoring bounds.
        Example weights: {"fit": 0.5, "salary": 0.3, "growth": 0.2}
        """
        if not items:
            return []

        # 1. Isolate min-max ranges to perform data normalization
        # Each criteria requires boundary ranges: MinMaxNormalization = (val - min) / (max - min)
        min_max: Dict[str, Dict[str, float]] = {}
        for criteria in criteria_weights.keys():
            vals = [float(item.get(criteria, 0.0)) for item in items]
            min_max[criteria] = {
                "min": min(vals) if vals else 0.0,
                "max": max(vals) if vals else 1.0
            }

        ranked_items = []
        for item in items:
            overall_score = 0.0
            
            for criteria, weight in criteria_weights.items():
                val = float(item.get(criteria, 0.0))
                c_min = min_max[criteria]["min"]
                c_max = min_max[criteria]["max"]
                
                # Avoid division by zero
                normalized_val = (val - c_min) / (c_max - c_min) if c_max > c_min else 1.0
                overall_score += normalized_val * weight
                
            item_copy = dict(item)
            item_copy["overall_priority_score"] = round(overall_score * 100.0, 2)
            ranked_items.append(item_copy)

        # Sort items by overall score descending
        return sorted(ranked_items, key=lambda x: x["overall_priority_score"], reverse=True)

    @staticmethod
    def calculate_ahp_weights(
        pairwise_matrix: List[List[float]], 
        criteria_names: List[str]
    ) -> Dict[str, float]:
        """
        Analytic Hierarchy Process (AHP) weight calculation.
        Computes the priority vector (normalized eigenvalues approximation) from a pairwise comparison matrix.
        """
        n = len(pairwise_matrix)
        if n == 0 or len(criteria_names) != n:
            return {}

        # 1. Calculate column sums
        col_sums = [0.0] * n
        for j in range(n):
            for i in range(n):
                col_sums[j] += pairwise_matrix[i][j]

        # 2. Normalize the matrix (divide each cell by its column sum) and calculate row averages
        weights = [0.0] * n
        for i in range(n):
            row_sum = 0.0
            for j in range(n):
                if col_sums[j] > 0.0:
                    row_sum += pairwise_matrix[i][j] / col_sums[j]
                else:
                    row_sum += 1.0 / n
            weights[i] = row_sum / n

        return {criteria_names[idx]: round(w, 4) for idx, w in enumerate(weights)}

