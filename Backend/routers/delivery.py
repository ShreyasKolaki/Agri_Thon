from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import db

router = APIRouter()


class DeliveryInput(BaseModel):
    order_id: str
    driver_id: str


@router.get("/available")
def available_orders():
    data = []
    for doc in db.orders.find({"status": "pending"}):
        doc["_id"] = str(doc["_id"])
        data.append(doc)
    return data


@router.post("/accept")
def accept_delivery(data: DeliveryInput):
    try:
        obj_id = ObjectId(data.order_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid order_id") from exc

    order = db.orders.find_one({"_id": obj_id})

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.orders.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "status": "shipped",
                "delivery_id": data.driver_id,
            }
        },
    )

    return {
        "message": "Delivery assigned successfully",
        "order_id": data.order_id,
        "driver_id": data.driver_id,
    }


@router.get("/my-deliveries/{driver_id}")
def my_deliveries(driver_id: str):
    data = []
    for doc in db.orders.find({"delivery_id": driver_id}):
        doc["_id"] = str(doc["_id"])
        data.append(doc)
    return data
