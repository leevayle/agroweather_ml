from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query

from server.database.mongodb import weather_collection
from server.services.weather_service import (
    get_current_weather,
)


router = APIRouter(
    prefix="/weather",
    tags=["Weather"],
)


# ============================================================
# CURRENT WEATHER
# ============================================================

@router.get("/current")
def current_weather():

    weather = get_current_weather()

    if weather is None:

        return {
            "station_id": "station_01",
            "status": "waiting_for_data",
            "message": (
                "No weather data has been received yet."
            ),
            "weather": {
                "temperature_c": None,
                "humidity_percent": None,
                "day_night": None,
                "rain_sensor": None,
                "rain_status": None,
                "rainfall_mm": None,
                "wind_speed_kmh": None,
                "wind_direction_deg": None,
                "pressure_hpa": None,
                "ldr_value": None,
            },
            "timestamp": None,
        }


    timestamp = weather.get("timestamp")

    if isinstance(timestamp, datetime):
        timestamp = timestamp.isoformat()


    return {
        "station_id": weather.get(
            "station_id"
        ),

        "status": "online",

        "weather": {
            "temperature_c": weather.get(
                "temperature_c"
            ),

            "humidity_percent": weather.get(
                "humidity_percent"
            ),

            "day_night": weather.get(
                "day_night"
            ),

            "rain_sensor": weather.get(
                "rain_sensor"
            ),

            "rain_status": weather.get(
                "rain_status"
            ),

            "rainfall_mm": weather.get(
                "rainfall_mm"
            ),

            "wind_speed_kmh": weather.get(
                "wind_speed_kmh"
            ),

            "wind_direction_deg": weather.get(
                "wind_direction_deg"
            ),

            "pressure_hpa": weather.get(
                "pressure_hpa"
            ),

            "ldr_value": weather.get(
                "ldr_value"
            ),
        },

        "timestamp": timestamp,
    }


# ============================================================
# WEATHER HISTORY
# ============================================================

@router.get("/history")
def weather_history(
    station_id: str = Query(
        "station_01"
    ),

    limit: int = Query(
        100,
        ge=1,
        le=1000,
    ),
):

    readings = weather_collection.find(
        {
            "station_id": station_id,
        }
    ).sort(
        "timestamp",
        -1,
    ).limit(limit)


    results = []

    for reading in readings:

        reading.pop("_id", None)

        timestamp = reading.get(
            "timestamp"
        )

        if isinstance(timestamp, datetime):
            reading["timestamp"] = (
                timestamp.isoformat()
            )

        results.append(reading)


    return {
        "station_id": station_id,
        "count": len(results),
        "readings": results,
    }