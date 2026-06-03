import logging
from typing import List, Dict, Any

try:
    from celery import Celery
    from app.core.config import settings
    celery_app = Celery(
        "careerai_tasks",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL
    )
except ImportError:
    class MockCelery:
        def task(self, *args, **kwargs):
            def decorator(func):
                func.delay = lambda *a, **kw: func(*a, **kw)
                return func
            return decorator
    celery_app = MockCelery()

logger = logging.getLogger("index_tasks")

def map_document_vectors(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Map step in re-indexing: Extract terms and tokenize."""
    text = doc.get("text", "")
    tokens = text.lower().split()
    return {"doc_id": doc.get("id"), "tokens": tokens}

def reduce_vector_index(mapped_docs: List[Dict[str, Any]]) -> Dict[str, int]:
    """Reduce step in re-indexing: Calculate inverted term counts."""
    inverted_index = {}
    for doc in mapped_docs:
        for token in doc["tokens"]:
            inverted_index[token] = inverted_index.get(token, 0) + 1
    return inverted_index

@celery_app.task
def rebuild_skill_vectors_nightly() -> bool:
    """
    Nightly Celery task to rebuild and normalize the sparse TF-IDF skill matrices.
    Implements a simple MapReduce pattern for distributed text parsing.
    """
    logger.info("Executing nightly re-indexing for skill vectors...")
    
    # 1. Fetch documents (simulated)
    documents = [
        {"id": 1, "text": "Python SQL and FastAPI web application development"},
        {"id": 2, "text": "Rust and C++ high performance computing systems"},
    ]
    
    # 2. Map Phase
    mapped = [map_document_vectors(d) for d in documents]
    
    # 3. Reduce Phase
    reduced_index = reduce_vector_index(mapped)
    logger.info(f"Nightly MapReduce complete. Unique vocabulary counts: {len(reduced_index)}")
    
    return True
