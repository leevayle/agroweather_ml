import hashlib
import logging
import re
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError, PyMongoError

from server.api.auth import get_current_user
from server.database.mongodb import calendar_collection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/calendar", tags=["Calendar"])


class CalendarTaskRequest(BaseModel):
    crop: str = Field(min_length=1, max_length=100)
    activity: str = Field(min_length=1, max_length=500)
    timing: str = Field(min_length=1, max_length=250)
    reason: str = Field(min_length=1, max_length=500)


def _task_key(body: CalendarTaskRequest) -> str:
    identity = "\n".join(
        value.strip().casefold()
        for value in (body.crop, body.activity, body.timing)
    )
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()


def _task_date(timing: str) -> Optional[str]:
    for candidate in re.findall(r"\b\d{4}-\d{2}-\d{2}\b", timing):
        try:
            return date.fromisoformat(candidate).isoformat()
        except ValueError:
            continue
    return None


@router.post("/tasks", status_code=status.HTTP_201_CREATED)
def add_calendar_task(
    body: CalendarTaskRequest,
    current_user=Depends(get_current_user),
):
    if any(
        not value.strip()
        for value in (body.crop, body.activity, body.timing, body.reason)
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Task details cannot be empty.",
        )

    user_id = str(current_user["_id"])
    task_key = _task_key(body)
    now = datetime.now(timezone.utc)
    task = {
        "user_id": user_id,
        "task_key": task_key,
        "crop": body.crop.strip(),
        "title": body.activity.strip(),
        "activity": body.activity.strip(),
        "timing": body.timing.strip(),
        "reason": body.reason.strip(),
        "date": _task_date(body.timing),
        "status": "planned",
        "source": "crop_insight",
        "created_at": now,
    }

    try:
        result = calendar_collection.update_one(
            {"user_id": user_id, "task_key": task_key},
            {"$setOnInsert": task},
            upsert=True,
        )
    except DuplicateKeyError:
        result = None
    except PyMongoError as exc:
        logger.exception("Could not save crop recommendation to calendar.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We couldn’t add this task to your calendar. Please try again.",
        ) from exc

    return {
        "message": "Task added to your calendar."
        if result is not None and result.upserted_id
        else "This task is already in your calendar.",
        "created": result is not None and result.upserted_id is not None,
    }
