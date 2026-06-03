import numpy as np
import logging
from typing import List

logger = logging.getLogger("similarity_calculator")

class SimilarityCalculator:
    """
    Batched Mathematical Similarity Engine.
    Executes vectorized NumPy operations to calculate Cosine, Dot Product,
    and Euclidean distances with batch CPU/GPU capability.
    """
    
    @staticmethod
    def calculate_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Calculate cosine similarity distance between two single float arrays."""
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        return float(dot / (norm_a * norm_b)) if norm_a > 0 and norm_b > 0 else 0.0

    @staticmethod
    def calculate_dot_product(vec_a: List[float], vec_b: List[float]) -> float:
        """Calculate mathematical dot product inner space values."""
        return float(np.dot(np.array(vec_a), np.array(vec_b)))

    @staticmethod
    def calculate_euclidean_distance(vec_a: List[float], vec_b: List[float]) -> float:
        """Calculate spatial Euclidean L2 distance coordinate indexes."""
        a = np.array(vec_a)
        b = np.array(vec_b)
        return float(np.linalg.norm(a - b))

    @staticmethod
    def batch_cosine_similarity(query_vec: List[float], matrix_vecs: List[List[float]]) -> List[float]:
        """
        Execute batched vector matrix multiplication to evaluate cosine scores.
        Batch Complexity: O(n * d) using vectorized NumPy matrix-vector multiplication.
        """
        if not matrix_vecs:
            return []
            
        q = np.array(query_vec, dtype=np.float32)
        mat = np.array(matrix_vecs, dtype=np.float32)
        
        # Calculate dot products for the entire batch in one step: mat * q
        dot_products = np.dot(mat, q)
        
        # Calculate norms along the rows
        norms_mat = np.linalg.norm(mat, axis=1)
        norm_q = np.linalg.norm(q)
        
        # Compute cosine similarities: dot / (norm_mat * norm_q)
        denominators = norms_mat * norm_q
        
        # Avoid division by zero
        scores = np.divide(dot_products, denominators, out=np.zeros_like(dot_products), where=denominators!=0)
        return scores.tolist()
