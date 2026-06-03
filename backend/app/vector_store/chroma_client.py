import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("chroma_client")

try:
    import chromadb
    chroma_available = True
except Exception:
    chroma_available = False

class ChromaClientWrapper:
    """
    ChromaDB Client Wrapper.
    Manages persistent connections, namespaces collections, and executes cosine queries.
    """
    def __init__(self):
        self.persist_dir = r"e:\CareerAI\backend\vector_data"
        os.makedirs(self.persist_dir, exist_ok=True)
        self._client = None

    def _get_client(self):
        """Lazy loader for persistent ChromaDB client."""
        if self._client is None and chroma_available:
            try:
                self._client = chromadb.PersistentClient(path=self.persist_dir)
                logger.info(f"Initialized ChromaDB persistent client at: {self.persist_dir}")
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB Persistent Client: {e}")
                self._client = None
        return self._client

    def get_or_create_collection(self, name: str) -> Optional[Any]:
        """Fetch or instantiate a named ChromaDB collection."""
        client = self._get_client()
        if not client:
            logger.warning(f"ChromaDB is unavailable. Bypassing collection creation: {name}")
            return None
        try:
            return client.get_or_create_collection(name=name, metadata={"hnsw:space": "cosine"})
        except Exception as e:
            logger.error(f"Failed to load ChromaDB collection '{name}': {e}")
            return None

    def upsert(self, collection_name: str, ids: List[str], embeddings: List[List[float]], documents: List[str], metadatas: List[Dict[str, Any]]):
        """Upsert document lists, embeddings, and metadata into target Chroma collection."""
        collection = self.get_or_create_collection(collection_name)
        if not collection:
            # Fallback: log activity to local persistent files
            from app.rag_engine.vector_indexer import LocalVectorStore
            store = LocalVectorStore(collection_name)
            for idx, doc_id in enumerate(ids):
                store.upsert(doc_id, documents[idx], embeddings[idx], metadatas[idx])
            return

        try:
            collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            logger.info(f"Upserted {len(ids)} documents inside Chroma collection: {collection_name}")
        except Exception as e:
            logger.error(f"ChromaDB upsert failed for collection {collection_name}: {e}")

    def query(self, collection_name: str, query_embeddings: List[List[float]], n_results: int = 5) -> List[Dict[str, Any]]:
        """Execute cosine ANN similarity queries against Chroma collections."""
        collection = self.get_or_create_collection(collection_name)
        if not collection:
            # Fallback query using persistent local stores
            from app.rag_engine.vector_indexer import LocalVectorStore
            store = LocalVectorStore(collection_name)
            results = store.query(query_embeddings[0], n_results=n_results)
            
            # Format outputs to mimic Chroma query structure
            ids, docs, metas, distances = [], [], [], []
            for similarity, doc in results:
                ids.append(doc["id"])
                docs.append(doc["text"])
                metas.append(doc["metadata"])
                distances.append(1.0 - similarity)  # Convert similarity to cosine distance
                
            return {
                "ids": [ids],
                "documents": [docs],
                "metadatas": [metas],
                "distances": [distances]
            }

        try:
            results = collection.query(
                query_embeddings=query_embeddings,
                n_results=n_results
            )
            return results
        except Exception as e:
            logger.error(f"ChromaDB cosine query failed on collection {collection_name}: {e}")
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

chroma_client_wrapper = ChromaClientWrapper()
