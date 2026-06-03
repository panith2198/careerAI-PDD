import logging
from typing import Dict, Any
from app.rag_engine.rag_chain import RagChain

logger = logging.getLogger("rag_service")

class RAGService:
    """
    RAG Orchestration Service.
    Coordinates multi-stage semantic extraction pipelines to answer career questions.
    """
    
    @staticmethod
    async def ask_knowledge_base(query: str, collection: str = "careers") -> Dict[str, Any]:
        """Query knowledge base and retrieve contextual cited answers."""
        try:
            results = await RagChain.query_rag_flow(query=query, collection_name=collection)
            return results
        except Exception as e:
            logger.error(f"RAG service execution failed: {e}")
            return {
                "answer": "An internal error occurred running RAG search pipelines. Please verify index configurations.",
                "context_documents": []
            }

rag_service = RAGService()
