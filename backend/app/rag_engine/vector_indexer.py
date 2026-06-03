import os
import json
import logging
import uuid
from typing import List, Dict, Any, Tuple
from app.rag_engine.document_loader import Document

logger = logging.getLogger("vector_indexer")

class LocalVectorStore:
    """
    State-of-the-art fallback persistent vector database.
    Integrates JSON matrix metadata tables and cosine similarity ANN searches.
    """
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self.data_dir = r"e:\CareerAI\backend\vector_data"
        os.makedirs(self.data_dir, exist_ok=True)
        self.file_path = os.path.join(self.data_dir, f"{collection_name}.json")
        self.documents: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load local vector collection {self.collection_name}: {e}")
                self.documents = []

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self.documents, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist local vector collection {self.collection_name}: {e}")

    def upsert(self, doc_id: str, text: str, embedding: List[float], metadata: Dict[str, Any]):
        """Upsert a single vector document."""
        # Check if already exists to perform a delta update
        existing = next((d for d in self.documents if d["id"] == doc_id), None)
        if existing:
            existing["text"] = text
            existing["embedding"] = embedding
            existing["metadata"] = metadata
        else:
            self.documents.append({
                "id": doc_id,
                "text": text,
                "embedding": embedding,
                "metadata": metadata
            })
        self._save()

    def query(self, query_embedding: List[float], n_results: int = 5) -> List[Tuple[float, Dict[str, Any]]]:
        """Perform a cosine similarity search over the document embeddings matrix."""
        if not self.documents or not query_embedding:
            return []

        scored_docs = []
        for doc in self.documents:
            doc_emb = doc["embedding"]
            # Cosine similarity: Dot product / (Norm A * Norm B)
            dot_product = sum(a * b for a, b in zip(query_embedding, doc_emb))
            norm_a = sum(a * a for a in query_embedding) ** 0.5
            norm_b = sum(b * b for b in doc_emb) ** 0.5
            
            similarity = dot_product / (norm_a * norm_b) if norm_a > 0 and norm_b > 0 else 0.0
            scored_docs.append((similarity, doc))
            
        # Sort by similarity score descending
        scored_docs = sorted(scored_docs, key=lambda x: x[0], reverse=True)
        return scored_docs[:n_results]

class VectorIndexer:
    """
    RAG Vector Indexer. Orchestrates vector updates, namespaces, 
    and handles upserts securely.
    """
    
    @staticmethod
    async def index_documents(collection_name: str, documents: List[Document], embeddings: List[List[float]]):
        """Seed and index a list of Documents with their pre-calculated embeddings."""
        store = LocalVectorStore(collection_name)
        
        for idx, doc in enumerate(documents):
            # Generate stable deterministic chunk ID or fresh UUID
            doc_id = doc.metadata.get("chroma_doc_id")
            if not doc_id:
                doc_id = f"chunk_{uuid.uuid4().hex[:12]}"
                doc.metadata["chroma_doc_id"] = doc_id
                
            store.upsert(
                doc_id=doc_id,
                text=doc.page_content,
                embedding=embeddings[idx],
                metadata=doc.metadata
            )
            
        logger.info(f"Successfully indexed {len(documents)} document chunks in collection: {collection_name}")
