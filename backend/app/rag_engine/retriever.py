from typing import List, Dict, Any
import logging
from app.rag_engine.vector_indexer import LocalVectorStore
from app.rag_engine.embedder import Embedder
from app.rag_engine.document_loader import Document

logger = logging.getLogger("retriever")

class Retriever:
    """
    RAG Hybrid Retriever. Unifies Dense Cosine Similarity queries
    and Sparse BM25-like keyword scoring via Reciprocal Rank Fusion (RRF).
    """
    
    @staticmethod
    def run_bm25_search(query: str, store_docs: List[Dict[str, Any]], top_n: int = 20) -> List[Dict[str, Any]]:
        """
        Runs a BM25 TF-IDF approximate keyword search over the collection.
        Matches exact keyword hits and frequencies.
        """
        query_words = set(query.lower().split())
        scored_docs = []
        
        for doc in store_docs:
            doc_text = doc["text"].lower()
            score = 0.0
            for word in query_words:
                # Basic Term Frequency (TF) boost
                tf = doc_text.count(word)
                if tf > 0:
                    # Logarithmic term frequency mapping
                    score += 1.0 + (tf ** 0.5)
            scored_docs.append((score, doc))
            
        scored_docs = sorted(scored_docs, key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_n] if score > 0.0]

    @classmethod
    async def retrieve(cls, query: str, collection_name: str) -> List[Document]:
        """
        Orchestrates hybrid retrieval.
        Retrieves top-20 dense documents, top-20 sparse documents,
        and fuses them using Reciprocal Rank Fusion (RRF) with constant k=60.
        """
        store = LocalVectorStore(collection_name)
        if not store.documents:
            return []
            
        # 1. Dense retrieval path
        query_embedding = await Embedder.embed_query(query)
        dense_results = store.query(query_embedding, n_results=20)
        dense_docs = [doc for _, doc in dense_results]
        
        # 2. Sparse retrieval path
        sparse_docs = cls.run_bm25_search(query, store.documents, top_n=20)
        
        # 3. Reciprocal Rank Fusion (RRF) with k=60
        k = 60
        rrf_scores: Dict[str, float] = {}
        doc_registry: Dict[str, Dict[str, Any]] = {}
        
        # Fuse Dense rankings
        for rank, doc in enumerate(dense_docs):
            doc_id = doc["id"]
            doc_registry[doc_id] = doc
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))
            
        # Fuse Sparse rankings
        for rank, doc in enumerate(sparse_docs):
            doc_id = doc["id"]
            doc_registry[doc_id] = doc
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))
            
        # Sort RRF results descending
        sorted_ids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)
        
        fused_documents = []
        for doc_id in sorted_ids[:30]:  # Cap at top-30 fused candidates
            doc = doc_registry[doc_id]
            fused_documents.append(Document(
                page_content=doc["text"],
                metadata=doc["metadata"]
            ))
            
        logger.info(f"Hybrid retrieval complete: {len(fused_documents)} unified RRF candidates extracted.")
        return fused_documents
