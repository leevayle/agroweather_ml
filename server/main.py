from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.config import (
    APP_VERSION,
    CORS_ORIGINS,
)

from server.database.mongodb import (
    test_connection,
)

from server.api.weather import (
    router as weather_router,
)

from server.api.forecast import (
    router as forecast_router,
)

from server.mqtt.subscriber import (
    MQTTSubscriber,
)

from server.services.forecast_cache import (
    get_cache_status,
    warm_forecast_cache,
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
    print(
        "=========================================="
    )

    print(
        "STARTING AGROWEATHER BACKEND"
    )

    print(
        "=========================================="
    )


    # --------------------------------------------------------
    # MongoDB
    # --------------------------------------------------------

    try:

        test_connection()

        print(
            "MongoDB connection successful."
        )

    except Exception as exc:

        print(
            "MongoDB connection failed:"
        )

        print(exc)


    # --------------------------------------------------------
    # FORECAST CACHE
    # --------------------------------------------------------

    try:

        print()

        print(
            "Preparing forecast cache..."
        )

        warm_forecast_cache()

        print(
            "Forecast cache is ready."
        )

    except Exception as exc:

        print(
            "Forecast cache failed:"
        )

        print(exc)


    # --------------------------------------------------------
    # MQTT
    # --------------------------------------------------------

    try:

        mqtt_subscriber.connect()

    except Exception as exc:

        print(
            "MQTT startup failed:"
        )

        print(exc)


    print()

    print(
        "AgroWeather backend startup complete."
    )

    print()


    yield


    # --------------------------------------------------------
    # SHUTDOWN
    # --------------------------------------------------------

    mqtt_subscriber.disconnect()

    print(
        "AgroWeather backend stopped."
    )


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="AgroWeather API",

    description=(
        "IoT weather station API for agricultural "
        "weather monitoring and forecasting."
    ),

    version=APP_VERSION,

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

        "message": (
            "AgroWeather API is running."
        ),

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


    cache_status = (
        get_cache_status()
    )


    return {
        "api": "online",

        "mongodb": mongo_status,

        "mqtt": (
            "connected"
            if mqtt_subscriber.running
            else "offline"
        ),

        "forecast_cache": (
            "ready"
            if cache_status["ready"]
            else "loading"
        ),

        "forecast_cache_days": (
            cache_status["days"]
        ),

        "timestamp": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),
    }