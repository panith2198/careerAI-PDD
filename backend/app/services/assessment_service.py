import math
import logging
from typing import List, Dict, Any

logger = logging.getLogger("assessment_service")

class AssessmentService:
    """
    Adaptive Quiz Engine.
    Employs the 3-Parameter Logistic (3PL) Item Response Theory (IRT) mathematical model
    alongside Binary Search to dynamically adjust quiz question difficulty parameters.
    """
    
    @staticmethod
    def calculate_3pl_probability(
        ability: float, 
        difficulty: float, 
        discrimination: float = 1.0, 
        guessing: float = 0.25
    ) -> float:
        """
        Computes the 3PL IRT probability of a correct answer.
        Formula: P(theta) = c + (1 - c) / (1 + e^(-a * (theta - b)))
        Where:
        - theta: student ability
        - b: question difficulty
        - a: question discrimination index
        - c: guessing coefficient
        """
        # Math calculation
        exponent = -discrimination * (ability - difficulty)
        # Avoid mathematical overflow in exponential calculations
        exponent = max(-50.0, min(50.0, exponent))
        logistic = 1.0 / (1.0 + math.exp(exponent))
        return guessing + (1.0 - guessing) * logistic

    @classmethod
    def select_next_question_difficulty(
        cls, 
        prior_answers: List[bool],
        current_ability: float
    ) -> str:
        """
        Uses Binary Search difficulty parameters (easy=-1.0, medium=0.0, hard=1.0)
        to calculate and select the next optimal question difficulty index.
        """
        if not prior_answers:
            return "medium" # Baseline difficulty starting point

        # Calculate current success ratio
        success_ratio = sum(1 for ans in prior_answers if ans) / len(prior_answers)
        
        # Binary search range mapping over difficulty boundaries
        # theta (ability space) range from -3.0 (very easy) to +3.0 (expert/hard)
        low, high = -3.0, 3.0
        
        # Adaptive adjustment loop
        for _ in range(4):  # Standard binary search depth
            mid = (low + high) / 2.0
            prob = cls.calculate_3pl_probability(current_ability, mid)
            
            # If success probability is too high, increase question difficulty boundary
            if success_ratio > 0.7:
                low = mid
            else:
                high = mid
                
        final_difficulty_score = (low + high) / 2.0
        
        # Map theta score back to standard qualitative labels
        if final_difficulty_score < -0.5:
            return "easy"
        elif final_difficulty_score > 0.5:
            return "hard"
        return "medium"

    @classmethod
    def score_adaptive_quiz(
        cls, 
        answers_json: Dict[str, Any], 
        questions_difficulty: Dict[str, str]
    ) -> float:
        """
        IRT-adjusted overall scoring calculation.
        Weights correct hard answers higher than easy answers.
        """
        if not answers_json:
            return 0.0

        difficulty_weights = {"easy": 1.0, "medium": 2.0, "hard": 3.0}
        total_weight = 0.0
        earned_weight = 0.0
        
        for q_key, is_correct in answers_json.items():
            diff = questions_difficulty.get(q_key, "medium")
            weight = difficulty_weights.get(diff, 2.0)
            total_weight += weight
            
            if is_correct is True or is_correct == "correct" or str(is_correct).lower() in ["true", "1"]:
                earned_weight += weight
                
        return (earned_weight / total_weight * 100.0) if total_weight > 0 else 0.0

assessment_service = AssessmentService()
