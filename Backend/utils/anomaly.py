import numpy as np

def detect_anomaly(prices, threshold=1.5):
    # Validate input
    if not isinstance(prices, (list, np.ndarray)):
        raise ValueError("Input must be a list or array of numbers")

    if len(prices) < 3:
        return []

    # Convert to numpy array
    prices = np.array(prices, dtype=float)

    mean = np.mean(prices)
    std = np.std(prices)

    # Avoid division by zero
    if std == 0:
        return []

    # Calculate z-scores
    z_scores = (prices - mean) / std

    # Find anomaly indices
    anomaly_indices = np.where(np.abs(z_scores) > threshold)[0]

    # Prepare result
    anomalies = []
    for i in anomaly_indices:
        anomalies.append({
            "index": int(i),
            "value": float(prices[i]),
            "z_score": float(z_scores[i])
        })

    return anomalies