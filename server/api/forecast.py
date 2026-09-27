from datetime import timedelta

from fastapi import APIRouter, HTTPException, Query

from server.services.forecast_cache import (
    get_cache_status,
    get_cached_forecast,
    get_forecast,
)


router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"],
)


# ============================================================
# DEFAULT FORECAST
# ============================================================

@router.get("")
def get_forecast_api(
    days: int = Query(
        7,
        ge=1,
        le=14,
    ),
):

    status = get_cache_status()


    if (
        status["ready"]
        and status["start_date"]
        and status["end_date"]
    ):

        start_date = status[
            "start_date"
        ]

        cached_end = status[
            "end_date"
        ]


        # ----------------------------------------------------
        # Limit default request to available cache
        # ----------------------------------------------------

        requested_end = (
            __import__(
                "datetime"
            ).date.fromisoformat(
                start_date
            )
            + timedelta(
                days=days - 1
            )
        )


        cached_end_date = (
            __import__(
                "datetime"
            ).date.fromisoformat(
                cached_end
            )
        )


        if requested_end > cached_end_date:

            requested_end = (
                cached_end_date
            )


        end_date = requested_end.isoformat()


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
    # Cache isn't ready
    # --------------------------------------------------------

    raise HTTPException(
        status_code=503,
        detail=(
            "Forecast cache is not ready yet. "
            "Please try again shortly."
        ),
    )


# ============================================================
# FORECAST RANGE
# ============================================================

@router.get("/range")
def get_forecast_range(
    start_date: str,
    end_date: str,
):

    try:

        return get_forecast(
            start_date,
            end_date,
        )


    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=(
                "Forecast generation failed: "
                f"{exc}"
            ),
        )


# ============================================================
# CACHE STATUS
# ============================================================

@router.get("/cache/status")
def forecast_cache_status():

    return get_cache_status()