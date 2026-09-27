from datetime import datetime, timezone
from threading import Lock
from typing import Any, Dict, Optional

from server.database.mongodb import (
    stations_collection,
    weather_collection,
)


# ============================================================
# CURRENT WEATHER CACHE
# ============================================================

_current_weather: Optional[Dict[str, Any]] = None

_cache_lock = Lock()


# ============================================================
# DEFAULT STATION
# ============================================================

DEFAULT_STATION_ID = "station_01"


# ============================================================
# NORMALIZE WEATHER DATA
# ============================================================

def normalize_weather_payload(
    payload: Dict[str, Any],
) -> Dict[str, Any]:

    station_id = payload.get(
        "station_id",
        DEFAULT_STATION_ID,
    )

    timestamp = datetime.now(timezone.utc)

    normalized = {
        "station_id": station_id,

        "timestamp": timestamp,

        "temperature_c": payload.get(
            "temperature_c"
        ),

        "humidity_percent": payload.get(
            "humidity_percent"
        ),

        "day_night": payload.get(
            "day_night"
        ),

        "rain_sensor": payload.get(
            "rain_sensor"
        ),

        "rain_status": payload.get(
            "rain_status"
        ),

        "rainfall_mm": payload.get(
            "rainfall_mm"
        ),

        "wind_speed_kmh": payload.get(
            "wind_speed_kmh"
        ),

        "wind_direction_deg": payload.get(
            "wind_direction_deg"
        ),

        "pressure_hpa": payload.get(
            "pressure_hpa"
        ),

        "ldr_value": payload.get(
            "ldr_value"
        ),
    }

    return normalized


# ============================================================
# SAVE WEATHER READING
# ============================================================

def save_weather_reading(
    payload: Dict[str, Any],
) -> Dict[str, Any]:

    global _current_weather

    weather = normalize_weather_payload(payload)

    # --------------------------------------------------------
    # Save historical reading
    # --------------------------------------------------------

    weather_collection.insert_one(weather.copy())


    # --------------------------------------------------------
    # Update current-weather cache
    # --------------------------------------------------------

    with _cache_lock:
        _current_weather = weather.copy()


    # --------------------------------------------------------
    # Update station status
    # --------------------------------------------------------

    station_id = weather["station_id"]

    stations_collection.update_one(
        {
            "station_id": station_id,
        },
        {
            "$set": {
                "status": "online",
                "last_seen": weather["timestamp"],
                "updated_at": weather["timestamp"],
            },
            "$setOnInsert": {
                "station_id": station_id,
                "name": f"AgroWeather {station_id}",
                "mqtt_topic": (
                    "agroweather/station/01/weather"
                ),
                "created_at": weather["timestamp"],
            },
        },
        upsert=True,
    )


    return weather


# ============================================================
# GET CURRENT WEATHER
# ============================================================

def get_current_weather() -> Optional[Dict[str, Any]]:

    with _cache_lock:

        if _current_weather is not None:
            return _current_weather.copy()


    # --------------------------------------------------------
    # Fallback to MongoDB
    # --------------------------------------------------------

    latest = weather_collection.find_one(
        {},
        sort=[
            ("timestamp", -1),
        ],
    )

    if latest is None:
        return None

    latest.pop("_id", None)

    return latest