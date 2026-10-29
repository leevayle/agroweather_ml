import json
import logging
from datetime import date, timedelta
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError

from server.api.auth import get_current_user
from server.config import GEMINI_API_KEY
from server.services.auth_service import serialize_user
from server.services.chat_service import (
    ChatConfigurationError,
    ChatProviderError,
    stream_chat_reply,
)
from server.services.forecast_service import get_cache_status, get_cached_forecast
from server.services.weather_service import get_current_weather

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Farm Chat"])


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=10)


def _farm_context(current_user, weather: Optional[dict], forecast: list) -> dict:
    user = serialize_user(current_user)
    return {
        "farm": {
            "name": user.get("farm_name"),
            "location": user.get("location"),
            "size": user.get("acres"),
            "crops": user.get("crops", []),
        },
        "current_weather": weather,
        "forecast": forecast,
    }


@router.post("")
def farm_chat(
    body: ChatRequest,
    current_user=Depends(get_current_user),
):
    message = body.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Message cannot be empty.",
        )
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Farm chat is not configured. Set GEMINI_API_KEY in the backend environment.",
        )

    try:
        current = get_current_weather()
    except PyMongoError:
        logger.exception("Could not load current weather for farm chat context.")
        current = None

    weather = None
    if current:
        weather = {
            key: current.get(key)
            for key in (
                "station_id",
                "temperature_c",
                "humidity_percent",
                "day_night",
                "rain_status",
                "rainfall_mm",
                "wind_speed_kmh",
                "wind_direction_deg",
                "pressure_hpa",
                "timestamp",
            )
        }

    forecast = []
    cache = get_cache_status()
    if cache["ready"] and cache["start_date"] and cache["end_date"]:
        cache_start = date.fromisoformat(cache["start_date"])
        cache_end = min(
            date.fromisoformat(cache["end_date"]),
            cache_start + timedelta(days=6),
        )
        forecast = get_cached_forecast(cache_start, cache_end) or []

    context = _farm_context(current_user, weather, forecast)
    history = [turn.dict() for turn in body.history]

    def response_events():
        try:
            for text in stream_chat_reply(message, history, context):
                yield f"event: token\ndata: {json.dumps({'text': text})}\n\n"
        except ChatConfigurationError as exc:
            logger.error("Farm chat configuration error: %s", exc)
            yield (
                "event: error\ndata: "
                f"{json.dumps({'message': 'The farm assistant is unavailable right now. Please try again later.'})}\n\n"
            )
        except ChatProviderError as exc:
            logger.warning(
                "Farm chat provider request failed (status=%s): %s",
                exc.status_code,
                exc.diagnostic or "No additional provider details.",
            )
            yield f"event: error\ndata: {json.dumps({'message': str(exc)})}\n\n"
        except Exception:
            logger.exception("Unexpected error while streaming a farm chat reply.")
            yield (
                "event: error\ndata: "
                f"{json.dumps({'message': 'The farm assistant is temporarily unavailable. Please try again later.'})}\n\n"
            )
        yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(
        response_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
