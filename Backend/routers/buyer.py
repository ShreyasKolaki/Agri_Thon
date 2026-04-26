from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import crops, db

router = APIRouter()


class OrderInput(BaseModel):
    crop_id: str
    buyer_id: str
    quantity: int


@router.get("/browse")
def browse():
    data = []
    for doc in crops.find({"status": "available"}):
        doc["_id"] = str(doc["_id"])
        data.append(doc)
    return data


@router.post("/order")
def place_order(data: OrderInput):
    try:
        crop_id = ObjectId(data.crop_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid crop_id") from exc

    crop = crops.find_one({"_id": crop_id})

    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    if crop["status"] != "available":
        raise HTTPException(status_code=409, detail="Crop not available")

    if data.quantity > crop["quantity"]:
        raise HTTPException(status_code=409, detail="Not enough quantity")

    total_price = crop["price"] * data.quantity

    order = {
        "crop_id": str(crop_id),
        "farmer_id": crop["farmer_id"],
        "buyer_id": data.buyer_id,
        "quantity": data.quantity,
        "total_price": total_price,
        "status": "pending",
    }

    result = db.orders.insert_one(order)
    order["_id"] = str(result.inserted_id)

    crops.update_one(
        {"_id": crop_id},
        {"$inc": {"quantity": -data.quantity}},
    )

    return {
        "message": "Order placed successfully",
        "order": order,
    }
