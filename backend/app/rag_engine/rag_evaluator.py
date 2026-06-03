import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("rag_evaluator")

class RagEvaluator:
    """
    RAG Quality Evaluator. Simulates RAGAS evaluation paradigms
    (faithfulness, answer relevance, and context recall)
    using precision-recall estimations over text intersections.
    """
    
    @staticmethod
    def calculate_f1_lexical(prediction: str, ground_truth: str) -> float:
        """Calculate lexical overlap precision, recall, and F1 score."""
        pred_words = set(prediction.lower().split())
        gt_words = set(ground_truth.lower().split())
        
        if not pred_words or not gt_words:
            return 0.0
            
        intersection = pred_words.intersection(gt_words)
        precision = len(intersection) / len(pred_words)
        recall = len(intersection) / len(gt_words)
        
        if precision + recall == 0:
            return 0.0
            
        f1 = (2 * precision * recall) / (precision + recall)
        return round(f1, 4)

    @classmethod
    def evaluate_rag_output(
        self,
        query: str,
        retrieved_contexts: List[str],
        generated_answer: str,
        ground_truth: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Evaluate RAG pipeline accuracy across core dimensions:
        * Faithfulness: Assess if answer concepts exist within retrieved contexts.
        * Context Recall: Measure lexical overlap between context blocks and query.
        * Answer Relevance: Calculate similarity overlap between answer and original query.
        """
        # Join contexts to evaluate faithfulness
        full_context = " ".join(retrieved_contexts)
        
        # 1. Faithfulness (Overlap of answer in context)
        faithfulness = self.calculate_f1_lexical(generated_answer, full_context)
        
        # 2. Context Recall (Overlap of context with target query)
        context_recall = self.calculate_f1_lexical(full_context, query)
        
        # 3. Answer Relevance (Overlap of answer with target query)
        answer_relevance = self.calculate_f1_lexical(generated_answer, query)
        
        # 4. Optional Ground Truth F1
        f1_score = 0.0
        if ground_truth:
            f1_score = self.calculate_f1_lexical(generated_answer, ground_truth)
            
        metrics = {
            "faithfulness": faithfulness,
            "context_recall": context_recall,
            "answer_relevance": answer_relevance,
        }
        
        if ground_truth:
            metrics["ground_truth_f1"] = f1_score
            
        logger.info(f"RAG Evaluation complete: Faithfulness={faithfulness}, Recall={context_recall}")
        return metrics
