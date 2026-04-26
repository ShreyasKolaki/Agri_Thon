from pydantic import BaseModel
from typing import Optional

class Order(BaseModel):
    crop_id: str
    farmer_id: str
    buyer_id: str
    quantity: int
    total_price: float
    status: str = "pending"
    delivery_id: Optional[str] = None