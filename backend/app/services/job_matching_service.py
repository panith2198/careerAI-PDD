import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.vector_store.hybrid_searcher import HybridSearcher

logger = logging.getLogger("job_matching_service")

class JobMatchingService:
    """
    Job Compatibility Matcher.
    Runs hybrid dense (ChromaDB Cosine ANN) and sparse (BM25) searches,
    returning lists of matches to the API layer.
    """
    
    @staticmethod
    async def match_candidate_to_jobs(
        query: str,
        collection_name: str,
        db: AsyncSession,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Perform unified hybrid candidate-job searches."""
        try:
            results = await HybridSearcher.search_hybrid(
                query=query,
                collection_name=collection_name,
                top_k=top_k
            )
            return results
        except Exception as e:
            logger.error(f"Job matching service failed: {e}")
            return []

job_matching_service = JobMatchingService()
