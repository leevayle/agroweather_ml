from datetime import date

from fastapi import APIRouter, HTTPException, Query

from server.services.forecast_service import (
    get_cache_status,
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
def forecast_default(
    days: int = Query(
        7,
        ge=1,
        le=14,
    ),
):

    status = get_cache_status()

    if not status["ready"]:
        raise HTTPException(
            status_code=503,
            detail=(
                "Forecast cache is not ready. "
                "Check backend startup logs."
            ),
        )

    cache_start = date.fromisoformat(
        status["start_date"]
    )

    requested_end = cache_start.fromordinal(
        cache_start.toordinal() + days - 1
    )

    try:

        return get_forecast(
            cache_start,
            requested_end,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Forecast generation failed: {exc}",
        ) from exc


# ============================================================
# FORECAST RANGE
# ============================================================

@router.get("/range")
def forecast_range(
    start_date: str,
    end_date: str,
):

    try:

        start = date.fromisoformat(
            start_date
        )

        end = date.fromisoformat(
            end_date
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=(
                "Dates must use YYYY-MM-DD format."
            ),
        ) from exc

    if end < start:

        raise HTTPException(
            status_code=400,
            detail=(
                "end_date cannot be before start_date."
            ),
        )

    try:

        return get_forecast(
            start,
            end,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Forecast generation failed: {exc}",
        ) from exc


# ============================================================
# CACHE STATUS
# ============================================================

@router.get("/status")
def forecast_status():

    return get_cache_status()