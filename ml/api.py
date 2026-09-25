from datetime import date, datetime, timedelta
from threading import Lock

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from forecast_engine import forecast, data


app = FastAPI(
    title="AgroWeather ML API",
    description="AgroWeather weather station and forecasting API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ============================================================
# IN-MEMORY CURRENT WEATHER
# ============================================================

weather_lock = Lock()

current_weather = {
    "temperature_c": None,
    "humidity_percent": None,
    "day_night": None,
    "rainfall_mm": None,
    "rain_status": None,
    "wind_speed_kmh": None,
    "wind_direction": None,
    "pressure_hpa": None,
    "timestamp": None,
    "source": "ESP32"
}


# ============================================================
# FORECAST CACHE
# ============================================================

forecast_cache = {
    "date": None,
    "days": None,
    "data": None
}

forecast_lock = Lock()


# ============================================================
# ESP32 DATA MODEL
# ============================================================

class SensorReading(BaseModel):

    temperature_c: float | None = None

    humidity_percent: float | None = Field(
        default=None,
        ge=0,
        le=100
    )

    day_night: str | None = None

    rainfall_mm: float | None = Field(
        default=None,
        ge=0
    )

    rain_status: str | None = None

    wind_speed_kmh: float | None = Field(
        default=None,
        ge=0
    )

    wind_direction: str | None = None

    pressure_hpa: float | None = None


# ============================================================
# ROOT — CURRENT WEATHER
# ============================================================

@app.get("/")
def current_weather_endpoint():

    with weather_lock:

        return {
            "status": "success",
            "type": "current_weather",
            "data": current_weather
        }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "api": "running",
        "models": "loaded"
    }


# ============================================================
# RECEIVE ESP32 SENSOR DATA
# ============================================================

@app.post("/sensor")
def receive_sensor_data(reading: SensorReading):

    global current_weather

    with weather_lock:

        current_weather = {
            "temperature_c": reading.temperature_c,
            "humidity_percent": reading.humidity_percent,
            "day_night": reading.day_night,
            "rainfall_mm": reading.rainfall_mm,
            "rain_status": reading.rain_status,
            "wind_speed_kmh": reading.wind_speed_kmh,
            "wind_direction": reading.wind_direction,
            "pressure_hpa": reading.pressure_hpa,
            "timestamp": datetime.now().isoformat(),
            "source": "ESP32"
        }

    return {
        "status": "success",
        "message": "Sensor data received",
        "timestamp": current_weather["timestamp"]
    }


# ============================================================
# FORECAST CACHE FUNCTION
# ============================================================

def get_cached_forecast(days: int):

    today = date.today()

    with forecast_lock:

        # Reuse forecast if it was generated today
        # and contains enough days.
        if (
            forecast_cache["date"] == today
            and forecast_cache["days"] is not None
            and forecast_cache["days"] >= days
        ):

            return forecast_cache["data"][:days]

        # Generate new forecast
        latest_date = data["time"].iloc[-1]

        start_date = latest_date + timedelta(days=1)

        end_date = latest_date + timedelta(days=days)

        results = forecast(
            start_date,
            end_date
        )

        # Save in memory
        forecast_cache["date"] = today
        forecast_cache["days"] = days
        forecast_cache["data"] = results

        return results


# ============================================================
# FORECAST
# ============================================================

@app.get("/forecast")
def get_forecast(days: int = 5):

    if days < 1:

        raise HTTPException(
            status_code=400,
            detail="days must be at least 1"
        )

    if days > 30:

        raise HTTPException(
            status_code=400,
            detail="Maximum forecast period is 30 days"
        )

    results = get_cached_forecast(days)

    return {
        "status": "success",
        "forecast_days": days,
        "forecast": results
    }


# ============================================================
# FORECAST RANGE
# ============================================================

@app.get("/forecast/range")
def get_forecast_range(
    start_date: date,
    end_date: date
):

    if end_date < start_date:

        raise HTTPException(
            status_code=400,
            detail="end_date must be after start_date"
        )

    number_of_days = (
        end_date - start_date
    ).days + 1

    if number_of_days > 30:

        raise HTTPException(
            status_code=400,
            detail="Maximum forecast period is 30 days"
        )

    results = forecast(
        start_date,
        end_date
    )

    return {
        "status": "success",
        "start_date": str(start_date),
        "end_date": str(end_date),
        "forecast_days": len(results),
        "forecast": results
    }