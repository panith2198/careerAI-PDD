import numpy as np
from typing import List, Tuple
from sklearn.cluster import KMeans, DBSCAN

class KMeansClustering:
    """
    K-Means & DBSCAN Persona Segmentation Engine.
    Executes standard K-Means clustering and DBSCAN
    using scikit-learn to partition student dataset vectors and handle isolated outliers.
    AI Prompt Role: Segmentation AI.
    """
    
    @staticmethod
    def calculate_distance(p1: List[float], p2: List[float]) -> float:
        """Calculate spatial Euclidean L2 distance between two points."""
        import math
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))

    @classmethod
    def fit_predict(
        cls, 
        data_points: List[List[float]], 
        k: int = 3, 
        max_iters: int = 10
    ) -> Tuple[List[List[float]], List[int]]:
        """
        Fits data points to clusters and yields final centroid centers
        and a list of matched integer cluster labels for each point using scikit-learn.
        """
        if not data_points:
            return [], []
            
        X = np.array(data_points, dtype=np.float32)
        n_samples = X.shape[0]
        
        # Adjust k if there are fewer samples than requested clusters
        n_clusters = min(k, n_samples)
        if n_clusters < 1:
            n_clusters = 1
            
        kmeans = KMeans(n_clusters=n_clusters, max_iter=max_iters, random_state=42, n_init='auto')
        labels = kmeans.fit_predict(X).tolist()
        centroids = kmeans.cluster_centers_.tolist()
        
        # If we had to reduce k, pad centroids to return k elements as expected by interface
        while len(centroids) < k:
            centroids.append([0.0] * X.shape[1] if X.shape[0] > 0 else [])
            
        return centroids, labels

    @classmethod
    def fit_dbscan(
        cls,
        data_points: List[List[float]],
        eps: float = 0.5,
        min_samples: int = 2
    ) -> List[int]:
        """
        DBSCAN density-based clustering algorithm using scikit-learn.
        Returns cluster labels where -1 represents outlier points.
        """
        if not data_points:
            return []
            
        X = np.array(data_points, dtype=np.float32)
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        labels = dbscan.fit_predict(X).tolist()
        
        return labels
