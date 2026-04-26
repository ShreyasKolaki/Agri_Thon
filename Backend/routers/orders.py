from fastapi import APIRouter
from database import db
from models import Order

router = APIRouter(prefix="/orders")

@router.post("/create")
def create_order(order: Order):
    db.orders.insert_one(order.dict())
    return {"msg": "Order created"}

@router.get("/")
def get_orders():
    return list(db.orders.find({}, {"_id": 0}))

@router.put("/{order_id}")
def update_order(order_id: str, status: str):
    db.orders.update_one(
        {"_id": order_id},
        {"$set": {"status": status}}
    )
    return {"msg": "Updated"}