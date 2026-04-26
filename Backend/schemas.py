from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    name: str
    email: str
    password: str
    role: str  # farmer / buyer / delivery
    language: Optional[str] = "en"

class Crop(BaseModel):
    name: str
    price: float
    quantity: int
    farmer_id: str