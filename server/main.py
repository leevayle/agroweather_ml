from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.config import (
    APP_VERSION,
    CORS_ORIGINS,
)

from server.database.mongodb import test_connection

from server.api.weather import (
    router as weather_router,
)

from server.api.forecast import (
    router as forecast_router,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AgroWeather API",
    description=(
        "IoT weather station API for agricultural "
        "weather monitoring and forecasting."
    ),
    version=APP_VERSION,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    weather_router
)

app.include_router(
    forecast_router
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "application": "AgroWeather",
        "status": "online",
        "message": "AgroWeather API is running.",
        "version": APP_VERSION,
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    mongo_status = "offline"

    try:

        test_connection()

        mongo_status = "online"

    except Exception:

        mongo_status = "offline"


    return {
        "api": "online",
        "mongodb": mongo_status,
        "timestamp": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),
    }