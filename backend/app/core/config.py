import os
from dotenv import load_dotenv

load_dotenv()

# -------------------------------
# SECURITY / JWT
# -------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "scrapx_super_secret_key_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 12


# -------------------------------
# DATABASE
# -------------------------------
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017"
)
DB_NAME = "scrapx"

NYCKEL_CLIENT_ID = os.getenv("NYCKEL_CLIENT_ID", "")
NYCKEL_CLIENT_SECRET = os.getenv("NYCKEL_CLIENT_SECRET", "")
NYCKEL_FUNCTION_ID = os.getenv("NYCKEL_FUNCTION_ID", "")

LOCAL_CONF_THRESHOLD = float(os.getenv("LOCAL_CONF_THRESHOLD", 0.75))

# -------------------------------
# SMTP / EMAIL
# -------------------------------
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# -------------------------------
# PAYPAL
# -------------------------------
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox") # sandbox or live
PAYPAL_SIMULATE = os.getenv("PAYPAL_SIMULATE", "false").lower() == "true"
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"
INR_TO_USD_RATE = 80.0
