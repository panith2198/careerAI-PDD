import logging
from typing import List, Tuple
from app.local_models.model_manager import model_manager

logger = logging.getLogger("msmarco_reranker")

class MSMarcoReranker:
    """
    BERT-based local cross-encoder reranking specialist (ms-marco-MiniLM-L-6-v2)
    sorting candidate document chunks based on pairwise query matches.
    """
    
    @staticmethod
    def rerank_passages(query: str, passages: List[str], top_n: int = 5) -> List[Tuple[float, str]]:
        """
        Rerank a list of passages for a query.
        Returns a list of tuples containing (score, passage) sorted by relevance descending.
        """
        if not passages:
            return []

        model = model_manager.load_model("reranker")
        
        # 1. Fallback when model is unconfigured
        if not model or model == "fallback":
            logger.warning("Local Reranker in fallback mode. Executing lexical Jaccard sorting.")
            query_words = set(query.lower().split())
            scored = []
            for p in passages:
                p_words = set(p.lower().split())
                intersection = query_words.intersection(p_words)
                union = query_words.union(p_words)
                jaccard = len(intersection) / len(union) if union else 0.0
                scored.append((jaccard, p))
            return sorted(scored, key=lambda x: x[0], reverse=True)[:top_n]

        # 2. Semantic CrossEncoder ranking
        try:
            pairs = [(query, p) for p in passages]
            scores = model.predict(pairs)
            
            # Map float types safely
            float_scores = [float(s) for s in scores]
            scored = sorted(zip(float_scores, passages), key=lambda x: x[0], reverse=True)
            return scored[:top_n]
        except Exception as e:
            logger.error(f"Semantic cross-encoder reranking failed: {e}")
            return [(0.0, p) for p in passages[:top_n]]

local_reranker = MSMarcoReranker()
