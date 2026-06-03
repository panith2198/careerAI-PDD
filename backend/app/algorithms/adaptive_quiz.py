import math
from typing import List, Dict, Any, Tuple

class AdaptiveQuizEngine:
    """
    Adaptive Quiz Engine based on Item Response Theory (IRT) 3-Parameter Logistic (3PL) Model.
    AI Prompt Role: Quiz adaptation AI.
    
    Formula for 3PL probability of correct response:
        P(θ) = c + (1 - c) / (1 + e^(-a * (θ - b)))
    Where:
        θ (theta) = User's latent ability estimate (typically in range [-3.0, 3.0])
        a = Discrimination parameter (steepness of the curve)
        b = Difficulty parameter (shift of the curve)
        c = Guessing parameter (lower asymptote)
    """

    @staticmethod
    def calculate_3pl_probability(theta: float, a: float, b: float, c: float) -> float:
        """
        Calculate the probability of a correct response given ability theta and item parameters.
        """
        try:
            exponent = -a * (theta - b)
            # Avoid overflow in exp
            if exponent > 50.0:
                prob_factor = 0.0
            elif exponent < -50.0:
                prob_factor = 1.0
            else:
                prob_factor = 1.0 / (1.0 + math.exp(exponent))
            
            return c + (1.0 - c) * prob_factor
        except Exception:
            return 0.5

    @staticmethod
    def calculate_item_information(theta: float, a: float, b: float, c: float) -> float:
        """
        Calculate Fisher Information for a 3PL item at ability level theta.
        Formula:
            I(θ) = [a^2 * (P(θ) - c)^2 * (1 - P(θ))] / [(1 - c)^2 * P(θ)]
        """
        p = AdaptiveQuizEngine.calculate_3pl_probability(theta, a, b, c)
        if p <= 0.0 or p >= 1.0 or c >= 1.0:
            return 0.0
        
        numerator = (a ** 2) * ((p - c) ** 2) * (1.0 - p)
        denominator = ((1.0 - c) ** 2) * p
        
        if denominator == 0.0:
            return 0.0
        return numerator / denominator

    @classmethod
    def estimate_ability_grid_search(
        cls, 
        responses: List[Dict[str, Any]], 
        grid_min: float = -3.0, 
        grid_max: float = 3.0, 
        grid_steps: int = 100
    ) -> float:
        """
        Estimate user ability (theta) using Maximum Likelihood Estimation via grid search.
        Each response in responses should contain:
            - "a": discrimination
            - "b": difficulty
            - "c": guessing
            - "correct": boolean or int (1 for correct, 0 for incorrect)
        """
        if not responses:
            return 0.0  # Default middle ground ability

        best_theta = 0.0
        max_log_likelihood = -float("inf")
        
        # Grid search to find theta that maximizes the log-likelihood function
        step_size = (grid_max - grid_min) / grid_steps
        for i in range(grid_steps + 1):
            theta = grid_min + i * step_size
            log_likelihood = 0.0
            
            for resp in responses:
                a = float(resp.get("a", 1.0))
                b = float(resp.get("b", 0.0))
                c = float(resp.get("c", 0.2))
                correct = 1 if resp.get("correct") else 0
                
                p = cls.calculate_3pl_probability(theta, a, b, c)
                # Keep p within bounds to avoid log(0)
                p = max(min(p, 0.9999), 0.0001)
                
                if correct == 1:
                    log_likelihood += math.log(p)
                else:
                    log_likelihood += math.log(1.0 - p)
            
            if log_likelihood > max_log_likelihood:
                max_log_likelihood = log_likelihood
                best_theta = theta
                
        return round(best_theta, 3)

    @classmethod
    def select_next_question(
        cls, 
        theta: float, 
        candidate_questions: List[Dict[str, Any]], 
        exclude_ids: List[int]
    ) -> Dict[str, Any]:
        """
        Selects the next optimal question by maximizing Item Information at user's current estimated ability.
        candidate_questions: List of item dicts, each must have:
            - "id": int / str
            - "a": float
            - "b": float
            - "c": float
        """
        best_item = {}
        max_info = -1.0
        exclude_set = set(exclude_ids)

        for item in candidate_questions:
            item_id = item.get("id")
            if item_id in exclude_set:
                continue

            a = float(item.get("a", 1.0))
            b = float(item.get("b", 0.0))
            c = float(item.get("c", 0.2))

            info = cls.calculate_item_information(theta, a, b, c)
            if info > max_info:
                max_info = info
                best_item = item

        return best_item
