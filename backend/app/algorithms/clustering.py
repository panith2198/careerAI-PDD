import math
from typing import List, Dict, Any, Tuple, Set

class KMeansClustering:
    """
    K-Means & DBSCAN Persona Segmentation Engine.
    Executes standard K-Means clustering ($O(n \\times k \\times d)$) and DBSCAN
    to partition student dataset vectors and handle isolated outliers.
    AI Prompt Role: Segmentation AI.
    """
    
    @staticmethod
    def calculate_distance(p1: List[float], p2: List[float]) -> float:
        """Calculate spatial Euclidean L2 distance between two points."""
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
        and a list of matched integer cluster labels for each point.
        """
        if not data_points:
            return [], []

        # 1. Centroid Initialization: pick first k elements as seeds
        centroids = [list(pt) for pt in data_points[:k]]
        
        # In case k is larger than data dimension boundary
        while len(centroids) < k:
            centroids.append([0.0] * len(data_points[0]))

        labels = [0] * len(data_points)

        # 2. Main iterative optimization loop
        for _ in range(max_iters):
            # Assignment phase: allocate each point to the nearest centroid
            for idx, pt in enumerate(data_points):
                min_dist = float("inf")
                best_label = 0
                for c_idx, cent in enumerate(centroids):
                    dist = cls.calculate_distance(pt, cent)
                    if dist < min_dist:
                        min_dist = dist
                        best_label = c_idx
                labels[idx] = best_label
                
            # Update phase: re-calculate centroid center vectors
            new_centroids = [[0.0] * len(data_points[0]) for _ in range(k)]
            counts = [0] * k
            
            for idx, pt in enumerate(data_points):
                l = labels[idx]
                counts[l] += 1
                for dim in range(len(pt)):
                    new_centroids[l][dim] += pt[dim]
                    
            for c_idx in range(k):
                if counts[c_idx] > 0:
                    for dim in range(len(new_centroids[0])):
                        new_centroids[c_idx][dim] /= counts[c_idx]
                else:
                    # Keep prior center if isolated cluster
                    new_centroids[c_idx] = centroids[c_idx]
                    
            centroids = new_centroids
            
        return centroids, labels

    @classmethod
    def fit_dbscan(
        cls,
        data_points: List[List[float]],
        eps: float = 0.5,
        min_samples: int = 2
    ) -> List[int]:
        """
        DBSCAN density-based clustering algorithm.
        Returns cluster labels where -1 represents outlier points.
        """
        if not data_points:
            return []

        n = len(data_points)
        labels = [-2] * n  # -2 means unvisited / undefined
        cluster_id = 0

        def get_neighbors(point_idx: int) -> List[int]:
            neighbors = []
            for i in range(n):
                if cls.calculate_distance(data_points[point_idx], data_points[i]) <= eps:
                    neighbors.append(i)
            return neighbors

        for i in range(n):
            if labels[i] != -2:
                continue

            neighbors = get_neighbors(i)
            if len(neighbors) < min_samples:
                labels[i] = -1  # Mark as noise / outlier initially
            else:
                # Expand cluster
                labels[i] = cluster_id
                queue = list(neighbors)
                # Remove the current point from the queue if present
                if i in queue:
                    queue.remove(i)

                idx = 0
                while idx < len(queue):
                    neighbor_idx = queue[idx]
                    if labels[neighbor_idx] == -1:
                        # Change noise to border point
                        labels[neighbor_idx] = cluster_id
                    elif labels[neighbor_idx] == -2:
                        labels[neighbor_idx] = cluster_id
                        n_neighbors = get_neighbors(neighbor_idx)
                        if len(n_neighbors) >= min_samples:
                            for nn in n_neighbors:
                                if nn not in queue:
                                    queue.append(nn)
                    idx += 1
                
                cluster_id += 1

        return labels

