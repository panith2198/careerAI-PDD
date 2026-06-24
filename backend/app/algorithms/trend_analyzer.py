import numpy as np
from typing import List

class TrendAnalyzer:
    """
    Market Demand Trend Analyst.
    Implements a Sliding Window average algorithm over time-series data
    and AutoRegressive (AR) forecasting using closed-form least squares.
    AI Prompt Role: Market trend AI.
    """
    
    @staticmethod
    def calculate_sliding_window_averages(
        time_series: List[float], 
        window_size: int = 3
    ) -> List[float]:
        """
        Executes a sliding window average over historical demand values.
        Complexity: O(n) using queue-like index updates.
        """
        if not time_series:
            return []

        if len(time_series) <= window_size:
            return [sum(time_series) / len(time_series)]

        averages = []
        # Initial window sum
        current_sum = sum(time_series[:window_size])
        averages.append(current_sum / window_size)

        # Slide window across remaining time indices
        for i in range(window_size, len(time_series)):
            # Add new right boundary, drop old left boundary
            current_sum += time_series[i] - time_series[i - window_size]
            averages.append(current_sum / window_size)

        return averages

    @staticmethod
    def detect_demand_spikes(
        time_series: List[float], 
        window_size: int = 3, 
        threshold_multiplier: float = 1.5
    ) -> List[int]:
        """
        Detect indices where current demand spikes significantly above the average
        of the preceding sliding window indices.
        """
        if len(time_series) <= window_size:
            return []

        averages = TrendAnalyzer.calculate_sliding_window_averages(time_series, window_size)
        spikes = []

        for i in range(window_size, len(time_series)):
            # Compare current index value against preceding window average score
            avg = averages[i - window_size]
            if avg > 0 and time_series[i] >= avg * threshold_multiplier:
                spikes.append(i)

        return spikes

    @staticmethod
    def forecast_autoregressive(
        time_series: List[float],
        p: int = 2,
        steps: int = 3
    ) -> List[float]:
        """
        AutoRegressive AR(p) time-series forecasting.
        Fits model coefficients using direct ordinary least squares (OLS) linear algebra.
        """
        n = len(time_series)
        if n <= p:
            # Fallback to simple mean if series is too short
            mean_val = sum(time_series) / max(n, 1)
            return [float(round(mean_val, 2))] * steps

        # Prepare regression matrices for OLS: y = X * beta
        y = np.array(time_series[p:], dtype=np.float32)
        X = np.zeros((n - p, p + 1), dtype=np.float32)
        X[:, 0] = 1.0  # Bias column
        
        # Populate history columns
        for i in range(n - p):
            X[i, 1:] = time_series[i : i + p]

        # Solve for coefficients beta using OLS least squares
        try:
            beta, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
            bias = float(beta[0])
            weights = beta[1:]
        except Exception:
            # Robust fallback to mean-based bias and zero weights
            bias = sum(time_series) / n
            weights = np.zeros(p, dtype=np.float32)

        # Forecast future values iteratively
        forecast = list(time_series)
        future_forecast = []
        for _ in range(steps):
            x = np.array(forecast[-p:], dtype=np.float32)
            next_val = bias + np.dot(weights, x)
            forecast.append(next_val)
            future_forecast.append(float(round(next_val, 2)))

        return future_forecast
