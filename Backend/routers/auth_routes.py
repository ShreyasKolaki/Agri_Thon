from fastapi import APIRouter
from pydantic import BaseModel
from database import users

router = APIRouter()

# -----------------------------
# 📦 Schemas
# -----------------------------

class SignupInput(BaseModel):
    role: str
    email: str = None
    phone: str = None
    password: str


class LoginInput(BaseModel):
    role: str
    email: str = None
    phone: str = None
    password: str


# -----------------------------
# 📝 SIGNUP
# -----------------------------
@router.post("/signup")
def signup(data: SignupInput):

    # Ensure either email or phone is provided
    if not data.email and not data.phone:
        return {"error": "Provide email or phone"}

    # Check existing user
    existing_user = users.find_one({
        "role": data.role,
        "$or": [
            {"email": data.email},
            {"phone": data.phone}
        ]
    })

    if existing_user:
        return {"error": "User already exists"}

    user = {
        "role": data.role,
        "email": data.email,
        "phone": data.phone,
        "password": data.password   # ⚠️ plain text (as you requested)
    }

    users.insert_one(user)

    return {"message": "Signup successful"}


# -----------------------------
# 🔓 LOGIN
# -----------------------------
@router.post("/login")
def login(data: LoginInput):

    if not data.email and not data.phone:
        return {"error": "Provide email or phone"}

    # Find user
    user = users.find_one({
        "role": data.role,
        "$or": [
            {"email": data.email},
            {"phone": data.phone}
        ]
    })

    if not user:
        return {"error": "User not found"}

    # Check password directly
    if user["password"] != data.password:
        return {"error": "Invalid password"}

    return {
        "message": "Login successful",
        "role": user["role"]
    }