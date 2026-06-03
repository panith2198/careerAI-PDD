import os
import logging
import numpy as np
from typing import List, Tuple

logger = logging.getLogger("faiss_index")

try:
    import faiss
    faiss_available = True
except Exception:
    faiss_available = False

class FAISSIndexManager:
    """
    FAISS Index Manager.
    Orchestrates high-speed IndexFlatIP batch similarity queries on normalized vectors.
    """
    def __init__(self, dimension: int = 1024):
        self.dimension = dimension
        self.index = None
        self._init_index()

    def _init_index(self):
        if faiss_available:
            try:
                # Use Inner Product index. When vectors are L2-normalized, IP equals Cosine Similarity
                self.index = faiss.IndexFlatIP(self.dimension)
                logger.info(f"Initialized FAISS IndexFlatIP index with dimension: {self.dimension}")
            except Exception as e:
                logger.error(f"Failed to initialize FAISS index: {e}")
                self.index = None

    def add_vectors(self, vectors: List[List[float]]):
        """Add list of vectors to FAISS index after L2-normalizing them."""
        if not vectors:
            return
            
        arr = np.array(vectors, dtype=np.float32)
        # L2 Normalize vectors along rows to map Inner Product to Cosine Similarity
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        # Avoid division by zero
        arr_normalized = np.divide(arr, norms, out=np.zeros_like(arr), where=norms!=0)

        if self.index:
            try:
                self.index.add(arr_normalized)
                logger.info(f"Successfully loaded {len(vectors)} vectors to FAISS index matrix.")
            except Exception as e:
                logger.error(f"FAISS add vectors failed: {e}")
        else:
            # Fallback: store vectors in a local numpy matrix list
            if not hasattr(self, "_numpy_matrix"):
                self._numpy_matrix = arr_normalized
            else:
                self._numpy_matrix = np.vstack([self._numpy_matrix, arr_normalized])

    def search(self, query_vector: List[float], k: int = 5) -> Tuple[List[float], List[int]]:
        """Search nearest vectors using Inner Product ANN calculations."""
        q_arr = np.array([query_vector], dtype=np.float32)
        q_norm = np.linalg.norm(q_arr)
        q_normalized = q_arr / q_norm if q_norm > 0 else q_arr

        if self.index:
            try:
                # Search FAISS index: returns distances (Inner Product) and matched index IDs
                distances, indices = self.index.search(q_normalized, k)
                return distances[0].tolist(), indices[0].tolist()
            except Exception as e:
                logger.error(f"FAISS query search failed: {e}")
                return [], []
        else:
            # Fallback: calculate matrix dot-products manually via NumPy vectorization
            if not hasattr(self, "_numpy_matrix") or self._numpy_matrix is None:
                return [], []
            try:
                # Manually calculate cosine similarities
                scores = np.dot(self._numpy_matrix, q_normalized[0])
                # Extract top-k index positions
                top_k_indices = np.argsort(scores)[::-1][:k]
                top_k_scores = scores[top_k_indices]
                return top_k_scores.tolist(), top_k_indices.tolist()
            except Exception as e:
                logger.error(f"Numpy matrix dot search failed: {e}")
                return [], []
