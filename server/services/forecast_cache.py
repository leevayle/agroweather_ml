from datetime import datetime, timedelta
from threading import Lock
from typing import Any, Dict, List, Optional

import pandas as pd

from ml.forecast_engine import forecast

from server.config import (
    FORECAST_CACHE_DAYS,
)


# ============================================================
# IN-MEMORY CACHE
# ============================================================

_cache_lock = Lock()

_forecast_cache: Dict[str, Dict[str, Any]] = {}

_cache_start_date: Optional[str] = None

_cache_end_date: Optional[str] = None

_cache_generated_at: Optional[str] = None

_cache_ready = False

_cache_loading = False

_cache_error: Optional[str] = None


# ============================================================
# CACHE STATUS
# ============================================================

def get_cache_status():

    with _cache_lock:

        return {
            "ready": _cache_ready,

            "loading": _cache_loading,

            "start_date": _cache_start_date,

            "end_date": _cache_end_date,

            "generated_at": _cache_generated_at,

            "days": len(
                _forecast_cache
            ),

            "error": _cache_error,
        }


# ============================================================
# GENERATE FORECAST CACHE
# ============================================================

def warm_forecast_cache():

    global _forecast_cache
    global _cache_start_date
    global _cache_end_date
    global _cache_generated_at
    global _cache_ready
    global _cache_loading
    global _cache_error


    with _cache_lock:

        _cache_loading = True

        _cache_ready = False

        _cache_error = None


    try:

        # ----------------------------------------------------
        # IMPORTANT
        # ----------------------------------------------------
        #
        # The ML engine determines the next available dates
        # based on the historical dataset.
        #
        # We first inspect the final historical date.
        # ----------------------------------------------------

        from ml.forecast_engine import data

        latest_date = pd.Timestamp(
            data["time"].iloc[-1]
        )


        start_date = (
            latest_date
            + pd.Timedelta(days=1)
        )


        end_date = (
            start_date
            + pd.Timedelta(
                days=FORECAST_CACHE_DAYS - 1
            )
        )


        print()
        print(
            "=========================================="
        )

        print(
            "WARMING FORECAST CACHE"
        )

        print(
            "=========================================="
        )

        print(
            f"Forecast start: "
            f"{start_date.date()}"
        )

        print(
            f"Forecast end: "
            f"{end_date.date()}"
        )

        print(
            f"Forecast days: "
            f"{FORECAST_CACHE_DAYS}"
        )

        print(
            "Running ML forecast..."
        )


        # ----------------------------------------------------
        # GENERATE FORECAST
        # ----------------------------------------------------

        results = forecast(
            start_date.strftime(
                "%Y-%m-%d"
            ),

            end_date.strftime(
                "%Y-%m-%d"
            ),
        )


        # ----------------------------------------------------
        # BUILD TEMPORARY CACHE
        # ----------------------------------------------------

        new_cache = {}

        for result in results:

            date_key = result["date"]

            new_cache[date_key] = result


        # ----------------------------------------------------
        # SAVE TO RAM
        # ----------------------------------------------------

        with _cache_lock:

            _forecast_cache = new_cache

            _cache_start_date = (
                start_date.strftime(
                    "%Y-%m-%d"
                )
            )

            _cache_end_date = (
                end_date.strftime(
                    "%Y-%m-%d"
                )
            )

            _cache_generated_at = (
                datetime.utcnow().isoformat()
            )

            _cache_ready = True

            _cache_loading = False

            _cache_error = None


        print(
            f"Forecast cache ready: "
            f"{len(new_cache)} days"
        )

        print(
            "=========================================="
        )

        print()


        return list(
            new_cache.values()
        )


    except Exception as exc:

        with _cache_lock:

            _cache_loading = False

            _cache_ready = False

            _cache_error = str(
                exc
            )


        print(
            "Forecast cache failed:"
        )

        print(
            exc
        )


        raise


# ============================================================
# CHECK WHETHER A RANGE IS CACHED
# ============================================================

def is_range_cached(
    start_date: str,
    end_date: str,
) -> bool:

    requested_start = pd.Timestamp(
        start_date
    )

    requested_end = pd.Timestamp(
        end_date
    )


    with _cache_lock:

        if not _cache_ready:

            return False


        if not _forecast_cache:

            return False


        cached_dates = sorted(
            _forecast_cache.keys()
        )


        cached_start = pd.Timestamp(
            cached_dates[0]
        )

        cached_end = pd.Timestamp(
            cached_dates[-1]
        )


        return (
            requested_start >= cached_start
            and
            requested_end <= cached_end
        )


# ============================================================
# GET CACHED FORECAST
# ============================================================

def get_cached_forecast(
    start_date: str,
    end_date: str,
) -> List[Dict[str, Any]]:

    with _cache_lock:

        results = []

        current_date = pd.Timestamp(
            start_date
        )

        final_date = pd.Timestamp(
            end_date
        )


        while current_date <= final_date:

            date_key = current_date.strftime(
                "%Y-%m-%d"
            )


            result = _forecast_cache.get(
                date_key
            )


            if result is None:

                raise KeyError(
                    f"Forecast date {date_key} "
                    "is not in RAM cache."
                )


            results.append(
                result
            )


            current_date += pd.Timedelta(
                days=1
            )


        return results


# ============================================================
# GET FORECAST
# ============================================================

def get_forecast(
    start_date: str,
    end_date: str,
) -> Dict[str, Any]:

    # --------------------------------------------------------
    # FAST PATH
    # --------------------------------------------------------

    if is_range_cached(
        start_date,
        end_date,
    ):

        return {
            "source": "memory_cache",

            "start_date": start_date,

            "end_date": end_date,

            "count": len(
                get_cached_forecast(
                    start_date,
                    end_date,
                )
            ),

            "forecast": get_cached_forecast(
                start_date,
                end_date,
            ),
        }


    # --------------------------------------------------------
    # SLOW PATH
    #
    # Requested range isn't in RAM.
    # Run the ML engine.
    # --------------------------------------------------------

    print(
        "Requested forecast is not in "
        "RAM cache."
    )

    print(
        f"Generating forecast: "
        f"{start_date} → {end_date}"
    )


    results = forecast(
        start_date,
        end_date,
    )


    # --------------------------------------------------------
    # Update RAM cache with newly generated results
    # --------------------------------------------------------

    with _cache_lock:

        for result in results:

            _forecast_cache[
                result["date"]
            ] = result


    return {
        "source": "ml_generated",

        "start_date": start_date,

        "end_date": end_date,

        "count": len(
            results
        ),

        "forecast": results,
    }