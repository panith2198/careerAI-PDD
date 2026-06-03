import random
from typing import List, Dict, Tuple
from app.algorithms.skill_vector import SkillVector

class RecommendationEngineAlg:
    """
    Core Recommendation Algorithms Engine.
    Executes collaborative filtering (via SVD Matrix Factorization) 
    and content-based filtering algorithms using raw TF-IDF skill matrices.
    AI Prompt Role: Recommendation strategist.
    """
    
    @staticmethod
    def recommend_careers(
        user_skills: List[str],
        careers_skills_taxonomy: Dict[str, List[str]],
        top_n: int = 3
    ) -> List[Tuple[float, str]]:
        """
        Recommends careers based on content similarity.
        Extracts TF-IDF representations of the user's skills and maps them against careers.
        """
        if not user_skills or not careers_skills_taxonomy:
            return []

        # 1. Compile documents for TF-IDF training
        # Documents = [UserSkills] + [Career 1 Skills] + [Career 2 Skills] + ...
        career_names = list(careers_skills_taxonomy.keys())
        documents = [user_skills]
        for name in career_names:
            documents.append(careers_skills_taxonomy[name])

        # Compute TF-IDF matrices
        vectors = SkillVector.compute_tf_idf_vectors(documents)
        if not vectors:
            return []

        user_vector = vectors[0]
        career_vectors = vectors[1:]

        # 2. Correlate user vector against career vectors
        scored_recommendations = []
        for idx, car_vec in enumerate(career_vectors):
            similarity = SkillVector.calculate_cosine_similarity(user_vector, car_vec)
            scored_recommendations.append((similarity, career_names[idx]))

        # Sort recommendations by similarity score descending
        scored_recommendations = sorted(scored_recommendations, key=lambda x: x[0], reverse=True)
        return scored_recommendations[:top_n]

    @staticmethod
    def run_svd_matrix_factorization(
        ratings_matrix: List[List[float]],
        latent_features: int = 2,
        lr: float = 0.01,
        reg: float = 0.02,
        steps: int = 100
    ) -> Tuple[List[List[float]], List[List[float]]]:
        """
        Pure Python SVD (Singular Value Decomposition) Matrix Factorization using Stochastic Gradient Descent.
        Decomposes R (m x n) into P (m x k) and Q (n x k) such that R ≈ P x Q^T.
        ratings_matrix: List of rows, where 0.0 represents unrated items.
        """
        if not ratings_matrix:
            return [], []

        num_users = len(ratings_matrix)
        num_items = len(ratings_matrix[0])

        # Initialize user latent vectors (P) and item latent vectors (Q) with random values
        random.seed(42)
        P = [[random.uniform(0.1, 1.0) for _ in range(latent_features)] for _ in range(num_users)]
        Q = [[random.uniform(0.1, 1.0) for _ in range(latent_features)] for _ in range(num_items)]

        # Run SGD
        for _ in range(steps):
            for u in range(num_users):
                for i in range(num_items):
                    if ratings_matrix[u][i] > 0.0:  # Only factorize observed ratings
                        # Predict rating as dot product of P[u] and Q[i]
                        pred_rating = sum(P[u][k] * Q[i][k] for k in range(latent_features))
                        err = ratings_matrix[u][i] - pred_rating
                        
                        # Update latent vectors using learning rate and regularization bounds
                        for k in range(latent_features):
                            p_val = P[u][k]
                            q_val = Q[i][k]
                            
                            P[u][k] += lr * (err * q_val - reg * p_val)
                            Q[i][k] += lr * (err * p_val - reg * q_val)

        return P, Q

