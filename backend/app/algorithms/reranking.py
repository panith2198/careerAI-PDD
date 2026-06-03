from typing import List, Dict, Any, Tuple, Callable
import math

class RerankingAlg:
    """
    Reranking Pipeline executing pairwise scoring and high-performance sorting.
    AI Prompt Role: Reranking agent.
    
    Implements:
        - Merge Sort algorithm ($O(k \\log k)$) for stable sorting of candidates.
        - Pairwise comparative scoring based on weights.
    """

    @classmethod
    def merge_sort(
        cls, 
        arr: List[Dict[str, Any]], 
        key_fn: Callable[[Dict[str, Any]], float]
    ) -> List[Dict[str, Any]]:
        """
        Merge Sort implementation for sorting items by descending score in O(k log k).
        """
        if len(arr) <= 1:
            return arr

        mid = len(arr) // 2
        left = cls.merge_sort(arr[:mid], key_fn)
        right = cls.merge_sort(arr[mid:], key_fn)

        return cls._merge(left, right, key_fn)

    @classmethod
    def _merge(
        cls, 
        left: List[Dict[str, Any]], 
        right: List[Dict[str, Any]], 
        key_fn: Callable[[Dict[str, Any]], float]
    ) -> List[Dict[str, Any]]:
        result = []
        i = j = 0

        while i < len(left) and j < len(right):
            # Sort descending: item with higher score comes first
            if key_fn(left[i]) >= key_fn(right[j]):
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1

        result.extend(left[i:])
        result.extend(right[j:])
        return result

    @classmethod
    def rerank_candidates(
        cls, 
        candidates: List[Dict[str, Any]], 
        query: str,
        text_field: str = "text",
        cross_encoder_fn: Callable[[str, List[str]], List[Tuple[float, str]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Rerank a list of candidate dictionaries by invoking a semantic cross-encoder 
        if provided, otherwise executing pairwise matching heuristics.
        
        Each candidate is expected to have a text_field (e.g. "text", "description").
        """
        if not candidates:
            return []

        passages = [c.get(text_field, "") for c in candidates]
        
        if cross_encoder_fn:
            # Run semantic cross-encoder
            scores_with_passages = cross_encoder_fn(query, passages)
            # Create lookup map
            score_map = {passage: score for score, passage in scores_with_passages}
            
            for c in candidates:
                txt = c.get(text_field, "")
                c["rerank_score"] = float(score_map.get(txt, 0.0))
        else:
            # Fallback pairwise lexical overlap matching
            query_words = set(query.lower().split())
            for c in candidates:
                txt = c.get(text_field, "").lower()
                overlap = sum(1 for word in query_words if word in txt)
                # Length normalization to prevent prioritizing extremely long texts
                words_count = len(txt.split()) + 1
                norm_score = overlap / math.log1p(words_count)
                c["rerank_score"] = float(norm_score)

        # Sort the candidates using merge sort in O(k log k) complexity
        return cls.merge_sort(candidates, lambda x: x.get("rerank_score", 0.0))
