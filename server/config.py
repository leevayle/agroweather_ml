from pathlib import Path
import os

from dotenv import load_dotenv


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


# ============================================================
# APPLICATION
# ============================================================

APP_NAME = "AgroWeather"
APP_VERSION = "1.0.0"

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))


# ============================================================
# CORS
# ============================================================

CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173",
)

CORS_ORIGINS = [
    origin.strip()
    for origin in CORS_ORIGINS_RAW.split(",")
    if origin.strip()
]

LOCAL_FRONTEND_ORIGIN = "http://localhost:8443"
if LOCAL_FRONTEND_ORIGIN not in CORS_ORIGINS:
    CORS_ORIGINS.append(LOCAL_FRONTEND_ORIGIN)


# ============================================================
# MONGODB
# ============================================================

MONGODB_URI = os.getenv("MONGODB_URI")

MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "agroweather",
)


# ============================================================
# MQTT
# ============================================================

MQTT_BROKER_HOST = os.getenv(
    "MQTT_BROKER_HOST",
    "",
)

MQTT_BROKER_PORT = int(
    os.getenv("MQTT_BROKER_PORT", "8883")
)

MQTT_USERNAME = os.getenv(
    "MQTT_USERNAME",
    "",
)

MQTT_PASSWORD = os.getenv(
    "MQTT_PASSWORD",
    "",
)

MQTT_TOPIC = os.getenv(
    "MQTT_TOPIC",
    "agroweather/station/01/weather",
)

MQTT_CLIENT_ID = os.getenv(
    "MQTT_CLIENT_ID",
    "agroweather-server",
)


# ============================================================
# AUTH / JWT
# ============================================================

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "agroweather-dev-secret-change-me",
)

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
)

JWT_EXPIRE_MINUTES = int(
    os.getenv("JWT_EXPIRE_MINUTES", "10080")
)

CONTACT_EMAIL = os.getenv(
    "CONTACT_EMAIL",
    "",
).strip()

SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME).strip()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()


# ============================================================
# MACHINE LEARNING
# ============================================================

ML_DATA_PATH = os.getenv(
    "ML_DATA_PATH",
    "ml/data/kisii_consecutive.csv",
)

ML_MODEL_DIR = os.getenv(
    "ML_MODEL_DIR",
    "ml/models",
)


# ============================================================
# FORECAST CACHE
# ============================================================

FORECAST_CACHE_DAYS = int(
    os.getenv("FORECAST_CACHE_DAYS", "7")
)

FORECAST_START_DATE = os.getenv(
    "FORECAST_START_DATE",
    "",
).strip()


# ============================================================
# VALIDATION
# ============================================================

def validate_required_configuration():
    if not MONGODB_URI:
        raise RuntimeError(
            "MONGODB_URI is not configured. "
            "Add it to the root .env file."
        )


# ============================================================
# PATH RESOLUTION
# ============================================================

def resolve_project_path(path_value: str) -> Path:
    path = Path(path_value)

    if path.is_absolute():
        return path

    return PROJECT_ROOT / path