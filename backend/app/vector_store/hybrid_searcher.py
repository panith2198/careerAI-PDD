from typing import List, Dict, Any
import logging
from app.vector_store.chroma_client import chroma_client_wrapper
from app.ai_engine.mistral_embedder import mistral_embedder

logger = logging.getLogger("hybrid_searcher")

class HybridSearcher:
    """
    Search-Dense Unified Search Engine.
    Executes BM25 sparse matching alongside ChromaDB dense HNSW ANN lookups,
    combining scores dynamically via Reciprocal Rank Fusion (RRF) with constant k=60.
    """
    
    @staticmethod
    def run_bm25_lexical(query: str, collection_docs: List[Dict[str, Any]], top_k: int = 20) -> List[Dict[str, Any]]:
        """Simple Term-Frequency keyword search fallback matching exact vocabulary terms."""
        query_terms = set(str(query).lower().split())
        scored = []
        
        for doc in collection_docs:
            doc_text = str(doc.get("text", "")).lower()
            score = 0.0
            for term in query_terms:
                tf = doc_text.count(term)
                if tf > 0:
                    score += 1.0 + (tf ** 0.5)
            scored.append((score, doc))
            
        scored = sorted(scored, key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored[:top_k] if score > 0.0]

    @classmethod
    async def search_hybrid(
        cls, 
        query: str, 
        collection_name: str, 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Orchestrate multi-stage search logic:
        1. Retrieve top-20 dense documents via Chroma vector space queries.
        2. Retrieve top-20 sparse documents via BM25 query lookups.
        3. Execute RRF fusion (k=60) to score and sort candidates, yielding top-k results.
        """
        # Fetch query embedding
        query_emb = await mistral_embedder.get_embedding(query)
        
        # 1. Dense retrieval path
        chroma_res = chroma_client_wrapper.query(collection_name, [query_emb], n_results=20)
        
        dense_docs = []
        if chroma_res and chroma_res.get("documents"):
            documents = chroma_res["documents"][0]
            metadatas = chroma_res["metadatas"][0]
            ids = chroma_res["ids"][0]
            
            for idx, text in enumerate(documents):
                dense_docs.append({
                    "id": ids[idx],
                    "text": text,
                    "metadata": metadatas[idx]
                })

        # 2. Sparse retrieval path
        # Retrieve all items from persistent files to run the BM25 query locally
        from app.rag_engine.vector_indexer import LocalVectorStore
        store = LocalVectorStore(collection_name)
        sparse_docs = cls.run_bm25_lexical(query, store.documents, top_k=20)
        
        # 3. Reciprocal Rank Fusion (RRF) with constant k=60
        k = 60
        rrf_scores: Dict[str, float] = {}
        registry: Dict[str, Dict[str, Any]] = {}
        
        # Score dense elements
        for rank, doc in enumerate(dense_docs):
            doc_id = doc["id"]
            registry[doc_id] = doc
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))
            
        # Score sparse elements
        for rank, doc in enumerate(sparse_docs):
            doc_id = doc["id"]
            registry[doc_id] = doc
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))
            
        # Sort by RRF score descending
        sorted_ids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)
        
        fused_results = []
        for doc_id in sorted_ids[:top_k]:
            fused_results.append(registry[doc_id])
            
        logger.info(f"Hybrid RRF query search completed successfully for: '{query}'")
        return fused_results
