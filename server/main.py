from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.api.forecast import router as forecast_router
from server.api.weather import router as weather_router

from server.config import (
    APP_NAME,
    APP_VERSION,
    CORS_ORIGINS,
)

from server.database.mongodb import test_connection

from server.mqtt.subscriber import MQTTSubscriber

from server.services.forecast_service import (
    initialize_forecast_cache,
)


# ============================================================
# MQTT
# ============================================================

mqtt_subscriber = MQTTSubscriber()


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print()
    print("========================================")
    print("STARTING AGROWEATHER BACKEND")
    print("========================================")
    print()

    # --------------------------------------------------------
    # MongoDB
    # --------------------------------------------------------

    try:

        test_connection()

        print("MongoDB connection successful.")

    except Exception as exc:

        print("MongoDB connection failed:")
        print(exc)

    # --------------------------------------------------------
    # Forecast cache
    # --------------------------------------------------------

    initialize_forecast_cache()

    # --------------------------------------------------------
    # MQTT
    # --------------------------------------------------------

    try:

        mqtt_subscriber.connect()

    except Exception as exc:

        print()
        print("MQTT startup failed:")
        print(exc)
        print()

    print()
    print("AgroWeather backend startup complete.")
    print()

    yield

    # --------------------------------------------------------
    # Shutdown
    # --------------------------------------------------------

    print()
    print("Stopping AgroWeather backend...")

    mqtt_subscriber.disconnect()

    print("AgroWeather backend stopped.")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "AgroWeather IoT weather station API"
    ),
    lifespan=lifespan,
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

app.include_router(weather_router)

app.include_router(forecast_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "online",
        "message": "AgroWeather API is running.",
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
        "mqtt": (
            "connected"
            if mqtt_subscriber.running
            else "offline"
        ),
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),
    }