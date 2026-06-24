import sys
import os

# Adjust path to import backend app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.algorithms.recommendation import RecommendationEngineAlg
from app.algorithms.clustering import KMeansClustering
from app.algorithms.trend_analyzer import TrendAnalyzer

print("--- 1. Testing Recommendation Engine ---")
user_skills = ["python", "machine learning", "data pipelines", "sql"]
taxonomy = {
    "Data Scientist": ["python", "machine learning", "statistics", "sql", "r"],
    "Software Engineer": ["python", "java", "data structures", "git", "sql"],
    "Frontend Developer": ["javascript", "react", "html", "css", "typescript"],
}
recs = RecommendationEngineAlg.recommend_careers(user_skills, taxonomy, top_n=2)
print("Recommendations:", recs)
assert len(recs) == 2, "Expected 2 recommendations"
assert recs[0][1] == "Data Scientist", "Expected Data Scientist as top recommendation"
print("SVD Matrix Factorization test:")
ratings = [
    [5.0, 3.0, 0.0],
    [4.0, 0.0, 4.0],
    [1.0, 1.0, 5.0],
    [0.0, 0.0, 4.0],
]
P, Q = RecommendationEngineAlg.run_svd_matrix_factorization(ratings, latent_features=2)
print("P shape (users x latent):", len(P), "x", len(P[0]))
print("Q shape (items x latent):", len(Q), "x", len(Q[0]))
assert len(P) == 4 and len(Q) == 3, "SVD dimensions mismatch"

print("\n--- 2. Testing KMeans & DBSCAN Clustering ---")
points = [
    [1.0, 2.0], [1.5, 1.8], [5.0, 8.0], [8.0, 8.0], [1.2, 1.9], [9.0, 9.0]
]
centroids, labels = KMeansClustering.fit_predict(points, k=2, max_iters=5)
print("KMeans Centroids:", centroids)
print("KMeans Labels:", labels)
assert len(centroids) == 2, "Expected 2 centroids"
assert len(labels) == len(points), "Labels mismatch"

db_labels = KMeansClustering.fit_dbscan(points, eps=1.0, min_samples=2)
print("DBSCAN Labels:", db_labels)
assert len(db_labels) == len(points), "DBSCAN labels mismatch"

print("\n--- 3. Testing Trend Analyzer (AR Forecasting) ---")
series = [10.0, 12.0, 15.0, 13.0, 17.0, 20.0, 25.0]
forecast = TrendAnalyzer.forecast_autoregressive(series, p=2, steps=3)
print("AR Forecast steps:", forecast)
assert len(forecast) == 3, "Expected 3 forecasted steps"

averages = TrendAnalyzer.calculate_sliding_window_averages(series, window_size=3)
print("Sliding window averages:", averages)
spikes = TrendAnalyzer.detect_demand_spikes(series, window_size=3, threshold_multiplier=1.2)
print("Spike indices:", spikes)

print("\nALL ALGORITHM TESTS PASSED SUCCESSFULLY!")
