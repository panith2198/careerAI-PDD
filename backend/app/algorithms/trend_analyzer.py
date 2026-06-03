from typing import List

class TrendAnalyzer:
    """
    Market Demand Trend Analyst.
    Implements a Sliding Window average algorithm over time-series data
    and AutoRegressive (AR) forecasting to project market trajectories.
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
        Fits model coefficients using simple gradient descent and forecasts future steps.
        """
        n = len(time_series)
        if n <= p:
            # Fallback to simple mean if series is too short
            mean_val = sum(time_series) / max(n, 1)
            return [mean_val] * steps

        # Initialize weights (coefficients)
        weights = [0.1] * p
        bias = 0.1
        lr = 0.01
        epochs = 100

        # Train coefficients using Gradient Descent
        for _ in range(epochs):
            for i in range(p, n):
                # Target value
                y_true = time_series[i]
                # Prediction input vector
                x = time_series[i-p:i]
                
                # Predict
                y_pred = bias + sum(weights[j] * x[j] for j in range(p))
                error = y_true - y_pred
                
                # Update weights and bias
                bias += lr * error
                for j in range(p):
                    weights[j] += lr * error * x[j]

        # Forecast future values iteratively
        forecast = list(time_series)
        future_forecast = []
        for _ in range(steps):
            x = forecast[-p:]
            next_val = bias + sum(weights[j] * x[j] for j in range(p))
            forecast.append(next_val)
            future_forecast.append(round(next_val, 2))

        return future_forecast

