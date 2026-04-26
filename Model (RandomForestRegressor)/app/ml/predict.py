import pickle
from pathlib import Path

import pandas as pd

from app.ml.train import train_model

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "app" / "ml" / "model.pkl"
COMMODITY_ENCODER_PATH = BASE_DIR / "app" / "ml" / "commodity_encoder.pkl"
GROUP_ENCODER_PATH = BASE_DIR / "app" / "ml" / "group_encoder.pkl"

if not MODEL_PATH.exists():
    print("Model not found. Training now...")
    train_model()

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(COMMODITY_ENCODER_PATH, "rb") as f:
    commodity_encoder = pickle.load(f)

with open(GROUP_ENCODER_PATH, "rb") as f:
    group_encoder = pickle.load(f)


def predict_price(
    day: int,
    month: int,
    year: int,
    price_t1: float,
    price_t2: float,
    price_t3: float,
    msp: float,
    arrival: float,
    commodity: str,
    group: str,
) -> float:
    try:
        commodity_encoded = commodity_encoder.transform([commodity])[0]
        group_encoded = group_encoder.transform([group])[0]

        input_data = pd.DataFrame(
            [
                {
                    "day": day,
                    "month": month,
                    "year": year,
                    "price_t-1": price_t1,
                    "price_t-2": price_t2,
                    "price_t-3": price_t3,
                    "msp": msp,
                    "arrival": arrival,
                    "commodity_encoded": commodity_encoded,
                    "group_encoded": group_encoded,
                }
            ]
        )

        prediction = model.predict(input_data)
        return max(0.0, float(prediction[0]))

    except ValueError as exc:
        raise ValueError(
            f"Prediction error: {exc}. Check commodity/group and input features."
        ) from exc
