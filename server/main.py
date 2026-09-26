import os
from pathlib import Path
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo.errors import PyMongoError

from server.database.mongodb import test_connection, weather_collection


load_dotenv()


app = FastAPI(
    title="AgroWeather API",
    description="IoT weather station API for agricultural weather monitoring and forecasting.",
    version="1.0.0",
)

FRONTEND_LOGO = Path(__file__).resolve().parent.parent / "frontend" / "logo.webp"


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return FileResponse(FRONTEND_LOGO, media_type="image/webp")


# --------------------------------------------------
# CORS
# --------------------------------------------------

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:8443,http://127.0.0.1:8443"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in cors_origins.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "application": "AgroWeather",
        "status": "online",
        "message": "AgroWeather API is running.",
        "version": "1.0.0",
    }


# --------------------------------------------------
# Health check
# --------------------------------------------------

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
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# --------------------------------------------------
# Current weather
# --------------------------------------------------

@app.get("/weather/current")
def current_weather():

    try:
        latest = weather_collection.find_one(
            {},
            sort=[("timestamp", -1)]
        )
    except PyMongoError:
        return {
            "station_id": "station_01",
            "status": "database_unavailable",
            "message": "Weather data is temporarily unavailable.",
            "weather": {
                "temperature_c": None,
                "humidity_percent": None,
                "rain_status": None,
                "rainfall_mm": None,
                "wind_speed_kmh": None,
                "wind_direction_deg": None,
                "pressure_hpa": None,
                "rain_sensor": None,
            },
            "timestamp": None,
        }

    if latest is None:
        return {
            "station_id": "station_01",
            "status": "waiting_for_data",
            "message": "No weather data has been received yet.",
            "weather": {
                "temperature_c": None,
                "humidity_percent": None,
                "rain_status": None,
                "rainfall_mm": None,
                "wind_speed_kmh": None,
                "wind_direction_deg": None,
                "pressure_hpa": None,
            },
            "timestamp": None,
        }

    return {
        "station_id": latest.get("station_id"),
        "status": "online",
        "weather": {
            "temperature_c": latest.get("temperature_c"),
            "humidity_percent": latest.get("humidity_percent"),
            "rain_status": latest.get("rain_status"),
            "rainfall_mm": latest.get("rainfall_mm"),
            "wind_speed_kmh": latest.get("wind_speed_kmh"),
            "wind_direction_deg": latest.get("wind_direction_deg"),
            "pressure_hpa": latest.get("pressure_hpa"),
            "rain_sensor": latest.get("rain_sensor"),
        },
        "timestamp": latest.get("timestamp"),
    }


@app.get("/weather/history")
def weather_history(limit: int = 7):
    if limit < 1 or limit > 30:
        return {
            "status": "invalid_request",
            "message": "limit must be between 1 and 30",
            "history": [],
        }

    try:
        readings = weather_collection.find(
            {},
            sort=[("timestamp", -1)],
            limit=limit,
        )
        history = []
        for reading in reversed(list(readings)):
            history.append({
                "timestamp": reading.get("timestamp"),
                "temperature_c": reading.get("temperature_c"),
                "humidity_percent": reading.get("humidity_percent"),
                "rainfall_mm": reading.get("rainfall_mm"),
                "wind_speed_kmh": reading.get("wind_speed_kmh"),
                "pressure_hpa": reading.get("pressure_hpa"),
            })
    except PyMongoError:
        history = []

    return {
        "status": "success",
        "history": history,
    }