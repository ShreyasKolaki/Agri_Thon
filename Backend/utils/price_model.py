import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Initialize model
model = RandomForestRegressor(n_estimators=100)

# Train model (simple training using history)
def train_model(history_prices):
    X = np.arange(len(history_prices)).reshape(-1, 1)  # time steps
    y = np.array(history_prices)

    model.fit(X, y)


# Predict next price
def predict_price(history_prices):
    try:
        if len(history_prices) < 2:
            raise ValueError("Need at least 2 data points")

        # Train model on given data
        train_model(history_prices)

        # Predict next step
        next_step = np.array([[len(history_prices)]])
        prediction = model.predict(next_step)

        return float(prediction[0])

    except Exception as e:
        return {"error": str(e)}