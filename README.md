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
├── main.py                  # FastAPI app entry point (supply chain API)
├── app/
│   └── main.py              # FastAPI app entry point (ML prediction API)
│   └── ml/
│       ├── train.py         # Model training script
│       └── predict.py       # Inference logic
│   └── utils/
│       ├── agent1.py        # AgriSmart AI chatbot logic
│       └── gemini.py        # Gemini API client with key rotation
├── routers/
│   ├── farmer.py            # Farmer routes (add crop, insights, profit)
│   ├── buyer.py             # Buyer routes (browse, order)
│   ├── delivery.py          # Delivery routes (accept, track)
│   ├── orders.py            # Order CRUD
│   ├── alerts.py            # Anomaly detection & price spike alerts
│   └── auth_routes.py       # Signup & login
├── database.py              # MongoDB connection (with FakeDB fallback)
├── models.py                # Pydantic order model
├── schemas.py               # Shared schemas (User, Crop, Prediction)
├── auth.py                  # Password hashing utilities
├── data/
│   └── agri_market_dataset_1year.csv   # Training dataset (8,533 records)
└── uploads/                 # Uploaded crop images
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-agri-supply-chain.git
cd smart-agri-supply-chain
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=agrithon
GEMINI_API_KEYS=your_key_1,your_key_2,your_key_3
```

> **Note:** `GEMINI_API_KEYS` accepts a comma-separated list of keys. The app automatically rotates between them on rate limits.
> If `MONGO_URI` is not set or the connection fails, the app falls back to an in-memory database automatically.

### 5. Train the ML model

```bash
python -m app.ml.train
```

This reads `data/agri_market_dataset_1year.csv`, trains a Random Forest model, and saves `model.pkl`, `commodity_encoder.pkl`, and `group_encoder.pkl` to `app/ml/`.

### 6. Run the servers

**Supply Chain API** (farmers, buyers, delivery, auth):
```bash
uvicorn main:app --reload --port 8000
```

**ML Prediction API** (price prediction + chatbot):
```bash
uvicorn app.main:app --reload --port 8001
```

---

## 🔌 API Overview

### Authentication
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

### Prediction & Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/predict?commodity=Rice` | Predict next price for a commodity |
| GET | `/chatbot?query=...` | Ask the AgriSmart AI assistant |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/alerts/anomaly` | Detect anomalies in a price list |
| POST | `/alerts/check-price-alert` | Check if a crop price triggers an alert |

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

## 🔒 Security Notes

- Passwords are stored in **plain text** in the current version. Consider hashing with `bcrypt` (utility already available in `auth.py`) before deploying to production.
- Keep your `.env` file out of version control — it is listed in `.gitignore`.

---

## 📦 Dependencies

Key packages (see `requirements.txt` for full list):

- `fastapi`, `uvicorn` — Web framework
- `pymongo[srv]` — MongoDB driver
- `scikit-learn`, `pandas`, `numpy` — ML & data processing
- `google-genai` — Gemini AI API
- `python-dotenv` — Environment variable management
- `passlib[bcrypt]` — Password hashing utilities
- `python-multipart` — File upload support

---

## 📄 License

This project was built for the **Agrithon** hackathon. Feel free to fork and extend it.
