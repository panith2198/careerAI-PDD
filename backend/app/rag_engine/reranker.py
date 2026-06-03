import logging
from typing import List, Tuple
from app.rag_engine.document_loader import Document

logger = logging.getLogger("reranker")

class Reranker:
    """
    Quality gate between retrieved candidate RAG chunks and target prompt builders.
    Deploys HuggingFace's ms-marco-MiniLM-L-6-v2 cross-encoder (CPU-optimized, zero API cost)
    to sort retrieve results down to the top-5 most relevant blocks.
    """
    def __init__(self):
        self.model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"
        self._model = None

    def _get_model(self):
        """Lazy loader for SentenceTransformers CrossEncoder."""
        if self._model is None:
            try:
                from sentence_transformers import CrossEncoder
                self._model = CrossEncoder(self.model_name)
                logger.info(f"Successfully loaded CrossEncoder: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to load sentence-transformers CrossEncoder: {e}. Falling back to internal lexical similarity rerank index.")
                self._model = "fallback"
        return self._model

    def rerank(self, query: str, candidates: List[Document], top_n: int = 5) -> List[Document]:
        """Rerank candidates based on pairwise semantic match scoring."""
        if not candidates:
            return []
            
        model = self._get_model()
        
        # 1. Perform semantic rerank using sentence-transformers CrossEncoder if loaded
        if model and model != "fallback":
            try:
                pairs = [(query, doc.page_content) for doc in candidates]
                scores = model.predict(pairs)
                
                # Pair and sort by score descending
                scored_candidates = sorted(zip(scores, candidates), key=lambda x: x[0], reverse=True)
                logger.info("Successfully reranked candidate list via local cross-encoder models.")
                return [doc for _, doc in scored_candidates[:top_n]]
            except Exception as e:
                logger.error(f"Semantic reranker evaluation failed: {e}. Triggering fallback.")
                
        # 2. Fallback: simple lexical jaccard string intersection overlap sorting
        query_words = set(query.lower().split())
        scored_candidates = []
        
        for doc in candidates:
            doc_words = set(doc.page_content.lower().split())
            intersection = query_words.intersection(doc_words)
            union = query_words.union(doc_words)
            jaccard = len(intersection) / len(union) if union else 0.0
            
            scored_candidates.append((jaccard, doc))
            
        scored_candidates = sorted(scored_candidates, key=lambda x: x[0], reverse=True)
        logger.info("Lexical jaccard intersection completed for candidates.")
        return [doc for _, doc in scored_candidates[:top_n]]

reranker = Reranker()
