from datetime import date, datetime, timedelta, timezone
from threading import Lock
from typing import Any, Dict, List, Optional

import pandas as pd

from server.config import (
    FORECAST_CACHE_DAYS,
    FORECAST_START_DATE,
    ML_DATA_PATH,
    resolve_project_path,
)

from ml.forecast_engine import forecast


# ============================================================
# FORECAST CACHE
# ============================================================

_cache_lock = Lock()

_cached_forecast: Optional[List[Dict[str, Any]]] = None

_cached_start_date: Optional[date] = None

_cached_end_date: Optional[date] = None

_cached_generated_at: Optional[datetime] = None


# ============================================================
# HELPERS
# ============================================================

def _load_latest_data_date() -> date:
    """
    Find the latest date available in the ML dataset.

    This is used only when FORECAST_START_DATE is not
    configured.
    """

    data_path = resolve_project_path(ML_DATA_PATH)

    if not data_path.exists():
        raise FileNotFoundError(
            f"ML dataset was not found: {data_path}"
        )

    dataframe = pd.read_csv(data_path)

    if "time" not in dataframe.columns:
        raise ValueError(
            "ML dataset must contain a 'time' column."
        )

    dataframe["time"] = pd.to_datetime(
        dataframe["time"],
        errors="coerce",
    )

    dataframe = dataframe.dropna(
        subset=["time"]
    )

    if dataframe.empty:
        raise ValueError(
            "ML dataset does not contain valid dates."
        )

    latest_timestamp = dataframe["time"].max()

    return latest_timestamp.date()


def _get_default_forecast_start() -> date:
    """
    Determine the first forecast date.

    Priority:

    1. FORECAST_START_DATE from .env
    2. Latest date in ML dataset + 1 day
    """

    if FORECAST_START_DATE:
        try:
            configured_date = date.fromisoformat(
                FORECAST_START_DATE
            )

            return configured_date

        except ValueError as exc:
            raise ValueError(
                "FORECAST_START_DATE must use "
                "YYYY-MM-DD format."
            ) from exc

    latest_data_date = _load_latest_data_date()

    return latest_data_date + timedelta(days=1)


def _normalise_results(
    results: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Convert date-like values into JSON-friendly strings.
    """

    normalised = []

    for item in results:
        result = dict(item)

        for key, value in result.items():

            if isinstance(value, (date, datetime)):
                result[key] = value.isoformat()

        normalised.append(result)

    return normalised


# ============================================================
# CACHE GENERATION
# ============================================================

def generate_forecast_cache(
    start_date: Optional[date] = None,
    days: Optional[int] = None,
) -> List[Dict[str, Any]]:

    global _cached_forecast
    global _cached_start_date
    global _cached_end_date
    global _cached_generated_at

    if start_date is None:
        start_date = _get_default_forecast_start()

    if days is None:
        days = FORECAST_CACHE_DAYS

    if days < 1:
        raise ValueError(
            "Forecast cache days must be at least 1."
        )

    end_date = start_date + timedelta(
        days=days - 1
    )

    print()
    print("========================================")
    print("GENERATING FORECAST CACHE")
    print("========================================")
    print(f"Start date : {start_date}")
    print(f"End date   : {end_date}")
    print(f"Days       : {days}")
    print()

    results = forecast(
        start_date.isoformat(),
        end_date.isoformat(),
    )

    results = _normalise_results(results)

    generated_at = datetime.now(timezone.utc)

    with _cache_lock:
        _cached_forecast = results
        _cached_start_date = start_date
        _cached_end_date = end_date
        _cached_generated_at = generated_at

    print("Forecast cache generated successfully.")
    print(f"Cached predictions: {len(results)}")
    print()

    return list(results)


# ============================================================
# CACHE LOOKUP
# ============================================================

def get_cached_forecast(
    start_date: date,
    end_date: date,
) -> Optional[List[Dict[str, Any]]]:

    with _cache_lock:

        if (
            _cached_forecast is None
            or _cached_start_date is None
            or _cached_end_date is None
        ):
            return None

        if start_date < _cached_start_date:
            return None

        if end_date > _cached_end_date:
            return None

        selected = []

        for item in _cached_forecast:

            item_date_value = item.get("date")

            if item_date_value is None:
                item_date_value = item.get(
                    "forecast_date"
                )

            if item_date_value is None:
                continue

            try:
                item_date = date.fromisoformat(
                    str(item_date_value)[:10]
                )

            except ValueError:
                continue

            if start_date <= item_date <= end_date:
                selected.append(dict(item))

        return selected


# ============================================================
# PUBLIC FORECAST FUNCTION
# ============================================================

def get_forecast(
    start_date: date,
    end_date: date,
) -> Dict[str, Any]:

    if end_date < start_date:
        raise ValueError(
            "end_date cannot be before start_date."
        )

    cached = get_cached_forecast(
        start_date,
        end_date,
    )

    if cached is not None:

        print(
            f"Forecast cache HIT: "
            f"{start_date} → {end_date}"
        )

        with _cache_lock:
            generated_at = _cached_generated_at
            cache_start = _cached_start_date
            cache_end = _cached_end_date

        return {
            "source": "ram_cache",
            "cached": True,
            "cache_start_date": (
                cache_start.isoformat()
                if cache_start
                else None
            ),
            "cache_end_date": (
                cache_end.isoformat()
                if cache_end
                else None
            ),
            "generated_at": (
                generated_at.isoformat()
                if generated_at
                else None
            ),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "count": len(cached),
            "forecast": cached,
        }

    print(
        f"Forecast cache MISS: "
        f"{start_date} → {end_date}"
    )

    results = generate_forecast_cache(
        start_date=start_date,
        days=(end_date - start_date).days + 1,
    )

    return {
        "source": "ml_generation",
        "cached": False,
        "cache_start_date": start_date.isoformat(),
        "cache_end_date": end_date.isoformat(),
        "generated_at": datetime.now(
            timezone.utc
        ).isoformat(),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "count": len(results),
        "forecast": results,
    }


# ============================================================
# CACHE STATUS
# ============================================================

def get_cache_status() -> Dict[str, Any]:

    with _cache_lock:

        return {
            "ready": _cached_forecast is not None,
            "start_date": (
                _cached_start_date.isoformat()
                if _cached_start_date
                else None
            ),
            "end_date": (
                _cached_end_date.isoformat()
                if _cached_end_date
                else None
            ),
            "generated_at": (
                _cached_generated_at.isoformat()
                if _cached_generated_at
                else None
            ),
            "count": (
                len(_cached_forecast)
                if _cached_forecast
                else 0
            ),
        }


# ============================================================
# STARTUP INITIALIZATION
# ============================================================

def initialize_forecast_cache():

    print()
    print("========================================")
    print("INITIALIZING FORECAST SERVICE")
    print("========================================")

    try:
        results = generate_forecast_cache()

        print(
            f"Forecast service ready with "
            f"{len(results)} predictions."
        )

        return True

    except Exception as exc:

        print()
        print("FORECAST CACHE INITIALIZATION FAILED")
        print("----------------------------------------")
        print(exc)
        print()
        print(
            "The API will continue starting, but "
            "forecast cache is currently unavailable."
        )
        print()

        return False