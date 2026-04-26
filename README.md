# 🌾 Smart Agri Supply Chain

An AI-powered agricultural supply chain platform that connects farmers, buyers, and delivery partners — with real-time price prediction, anomaly alerts, and an intelligent chatbot.

---

## 📌 Features

- **Farmer Portal** — Add crops, get AI price insights, and calculate profit/ROI
- **Buyer Portal** — Browse available crops and place orders
- **Delivery Portal** — Accept and track delivery assignments
- **Price Prediction** — ML model (Random Forest) trained on 1-year market data
- **Anomaly Alerts** — Detect price spikes and unusual market activity
- **AgriSmart Chatbot** — Gemini-powered AI assistant for farmers, buyers, and drivers

---

## 🗂️ Project Structure

```
Smart Agriculture/
│
├── Backend/
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── alerts.py          # Anomaly detection & price spike alerts
│   │   ├── auth_routes.py     # Signup & login
│   │   ├── buyer.py           # Browse crops & place orders
│   │   ├── delivery.py        # Accept & track deliveries
│   │   ├── farmer.py          # Add crops, price insights, profit
│   │   └── orders.py          # Order CRUD
│   ├── utils/
│   │   ├── anomaly.py         # Anomaly detection logic
│   │   ├── price_model.py     # Price prediction utility
│   │   ├── profit.py          # Profit/ROI calculator
│   │   └── translator.py      # Language translation utility
│   ├── uploads/               # Uploaded crop images
│   ├── .gitignore
│   ├── auth.py                # Password hashing utilities
│   ├── database.py            # MongoDB connection (with FakeDB fallback)
│   ├── main.py                # FastAPI app entry point
│   ├── models.py              # Pydantic order model
│   ├── requirements.txt
│   └── schemas.py             # Shared schemas (User, Crop)
│
├── Frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── AIChatbot.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── NavLink.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── BuyerDashboard.tsx
│   │   │   ├── DeliveryDashboard.tsx
│   │   │   ├── FarmerDashboard.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   └── NotFound.tsx
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── Model (RandomForestRegressor)/
│   ├── data/
│   │   └── agri_market_dataset_1year.csv   # Training dataset (8,533 records)
│   ├── app/
│   │   ├── ml/
│   │   │   ├── train.py       # Model training script
│   │   │   ├── predict.py     # Inference logic
│   │   │   ├── model.pkl      # Trained model (generated)
│   │   │   ├── commodity_encoder.pkl
│   │   │   └── group_encoder.pkl
│   │   └── utils/
│   │       ├── agent1.py      # AgriSmart AI chatbot logic
│   │       └── gemini.py      # Gemini API client with key rotation
│   ├── main.py                # FastAPI ML prediction + chatbot API
│   ├── schemas.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/ShreyasKolaki/Agri_Thon.git
cd Agri_Thon
```

---

### 🔧 Backend Setup

```bash
cd Backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=agrithon
GEMINI_API_KEYS=your_key_1,your_key_2,your_key_3
```

> `GEMINI_API_KEYS` accepts a comma-separated list — the app auto-rotates on rate limits.
> If `MONGO_URI` is missing or unreachable, the app falls back to an in-memory database automatically.

Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

---

### 🤖 ML Model Setup

```bash
cd "Model (RandomForestRegressor)"
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

Train the model (only needed once):

```bash
python -m app.ml.train
```

This reads `data/agri_market_dataset_1year.csv` and saves `model.pkl`, `commodity_encoder.pkl`, and `group_encoder.pkl` to `app/ml/`.

Run the ML API:

```bash
uvicorn main:app --reload --port 8001
```

---

### 🎨 Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

---

## 🔌 API Overview

### Authentication (`localhost:8000`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register as farmer, buyer, or delivery |
| POST | `/auth/login` | Login with email or phone |

### Farmer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/farmer/add-crop` | Add a crop listing (with optional image) |
| POST | `/farmer/price-insights` | Get predicted price & sell/hold suggestion |
| POST | `/farmer/profit` | Calculate profit and ROI |

### Buyer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buyer/browse` | List all available crops |
| POST | `/buyer/order` | Place an order |

### Delivery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/delivery/available` | List pending orders |
| POST | `/delivery/accept` | Accept a delivery |
| GET | `/delivery/my-deliveries/{driver_id}` | View assigned deliveries |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/alerts/anomaly` | Detect anomalies in a price list |
| POST | `/alerts/check-price-alert` | Check if a crop price triggers an alert |

### Prediction & Chatbot (`localhost:8001`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/predict?commodity=Rice` | Predict next price for a commodity |
| GET | `/chatbot?query=...` | Ask the AgriSmart AI assistant |

---

## 🤖 ML Model

- **Algorithm:** Random Forest Regressor (150 estimators)
- **Features:** Day, month, year, 3 lagged prices, MSP, arrival volume, commodity, commodity group
- **Target:** Next day's market price
- **Dataset:** 8,533 records across multiple commodities over 1 year
- **Split:** 80/20 train-test (no shuffle — respects time-series order)

---

## 🧠 AgriSmart Chatbot

Powered by **Gemini 2.5 Flash**. Supports multi-key rotation for high availability. Provides:

- Market trend insights
- Sell/hold recommendations
- Alerts and anomaly explanations
- Role-aware advice (farmer / buyer / delivery)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | FastAPI, Python |
| Database | MongoDB Atlas (with in-memory fallback) |
| ML Model | scikit-learn (Random Forest) |
| AI Chatbot | Google Gemini 2.5 Flash |
| Auth | Plain-text passwords (bcrypt-ready via `auth.py`) |

---

## 🔒 Security Notes

- Passwords are stored in **plain text** in the current version. The `auth.py` bcrypt utility is already in place — wire it in before any production deployment.
- Keep your `.env` file out of version control — it is listed in `.gitignore`.

---

## 📄 License

This project was built for the **Agrithon** hackathon. Feel free to fork and extend it.
