from pathlib import Path
import os

from dotenv import load_dotenv


# ============================================================
# PROJECT PATH
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
# ML
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
# VALIDATION
# ============================================================

def validate_required_configuration():
    """
    Validate configuration required for the backend to operate.

    MQTT is intentionally not required here because we may start
    the API before configuring the cloud MQTT broker.
    """

    if not MONGODB_URI:
        raise RuntimeError(
            "MONGODB_URI is not configured. "
            "Add it to the root .env file."
        )


def resolve_project_path(path_value: str) -> Path:
    """
    Convert a relative project path into an absolute path.

    Absolute paths are returned unchanged.
    """

    path = Path(path_value)

    if path.is_absolute():
        return path

    return PROJECT_ROOT / path