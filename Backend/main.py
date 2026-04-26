from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers.alerts import router as alerts_router
from routers.auth_routes import router as auth_router
from routers.buyer import router as buyer_router
from routers.delivery import router as delivery_router
from routers.farmer import router as farmer_router
from routers.orders import router as orders_router
from database import DB_MODE

app = FastAPI(title="Smart Agri Supply Chain")

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

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(farmer_router, prefix="/farmer", tags=["Farmer"])
app.include_router(buyer_router, prefix="/buyer", tags=["Buyer"])
app.include_router(delivery_router, prefix="/delivery", tags=["Delivery"])
app.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(orders_router, tags=["Orders"])


@app.get("/")
def home():
    return {"message": "Agri Backend Running", "database": DB_MODE}
