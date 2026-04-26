from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict

from utils.anomaly import detect_anomaly

router = APIRouter()

# -----------------------------
# 📦 Schemas
# -----------------------------
class PriceInput(BaseModel):
    prices: List[float]


class CropInput(BaseModel):
    name: str
    price: float


# -----------------------------
# 🚨 Anomaly Detection
# -----------------------------
@router.post("/anomaly")
def anomaly(data: PriceInput):
    try:
        anomalies = detect_anomaly(data.prices)
        return {"anomalies": anomalies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 🔔 Price Spike Alert Logic
# -----------------------------
def check_price_spike(crop: Dict):
    if crop["price"] > 50:
        return {
            "type": "ALERT",
            "message": f"🚨 Price spike detected for {crop['name']}",
            "tag": "Alert"
        }
    return None


# -----------------------------
# 🔔 Manual Alert Endpoint (Test / UI)
# -----------------------------
@router.post("/check-price-alert")
def price_alert(crop: CropInput):
    alert = check_price_spike(crop.dict())

    if alert:
        return {"alert": alert}

    return {"message": "No alert"}