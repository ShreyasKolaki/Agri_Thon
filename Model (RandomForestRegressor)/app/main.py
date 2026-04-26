from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ml.predict import predict_price
from app.schemas import PredictionResponse
from app.utils.agent1 import agent1_chat

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "agri_market_dataset_1year.csv"

df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()
df = df.rename(
    columns={
        "Commodity": "commodity",
        "Commodity Group": "group",
        "MSP (Rs./Quintal)": "msp",
        "Arrival (Metric Tonnes)": "arrival",
        "Price": "price",
    }
)
df["date"] = pd.to_datetime(df["Date"])
df = df.sort_values(["commodity", "date"])

app = FastAPI(title="Agri Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Agri Price Prediction API is running"}


@app.get("/predict", response_model=PredictionResponse)
def get_prediction(commodity: str):
    now = datetime.now()
    filtered = df[df["commodity"].str.lower() == commodity.lower()]

    if len(filtered) < 3:
        return {
            "predicted_price": 0.0,
            "suggestion": f"Not enough data for '{commodity}'",
        }

    price_t1 = float(filtered.iloc[-1]["price"])
    price_t2 = float(filtered.iloc[-2]["price"])
    price_t3 = float(filtered.iloc[-3]["price"])

    latest = filtered.iloc[-1]
    msp = float(latest["msp"])
    arrival = float(latest["arrival"])
    group = latest["group"]

    predicted_price = predict_price(
        day=now.day,
        month=now.month,
        year=now.year,
        price_t1=price_t1,
        price_t2=price_t2,
        price_t3=price_t3,
        msp=msp,
        arrival=arrival,
        commodity=commodity,
        group=group,
    )

    if predicted_price > price_t1:
        suggestion = "HOLD"
    elif predicted_price < price_t1:
        suggestion = "SELL"
    else:
        suggestion = "STABLE"

    return {
        "predicted_price": predicted_price,
        "suggestion": suggestion,
    }


@app.get("/chatbot")
def chatbot(query: str):
    try:
        return agent1_chat(query)
    except Exception as exc:
        return {"response": f"Chatbot is temporarily unavailable: {exc}"}
