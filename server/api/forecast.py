from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, Query

from ml.forecast_engine import forecast


router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"],
)


# ============================================================
# DEFAULT FORECAST
# ============================================================

@router.get("")
def get_forecast(
    days: int = Query(
        5,
        ge=1,
        le=14,
    ),
):

    start_date = date.today()

    end_date = (
        start_date
        + timedelta(days=days - 1)
    )


    try:

        results = forecast(
            start_date.isoformat(),
            end_date.isoformat(),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Forecast generation failed: {exc}",
        )


    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "count": len(results),
        "forecast": results,
    }


# ============================================================
# FORECAST RANGE
# ============================================================

@router.get("/range")
def get_forecast_range(
    start_date: str,
    end_date: str,
):

    try:

        results = forecast(
            start_date,
            end_date,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=f"Forecast generation failed: {exc}",
        )


    return {
        "start_date": start_date,
        "end_date": end_date,
        "count": len(results),
        "forecast": results,
    }