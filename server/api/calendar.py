import hashlib
import logging
import re
from datetime import date as CalendarDate
from datetime import datetime, timezone
from typing import Literal, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
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


class CalendarTaskUpdate(BaseModel):
    crop: Optional[str] = Field(default=None, min_length=1, max_length=100)
    activity: Optional[str] = Field(default=None, min_length=1, max_length=500)
    timing: Optional[str] = Field(default=None, min_length=1, max_length=250)
    reason: Optional[str] = Field(default=None, max_length=500)
    date: Optional[CalendarDate] = None
    status: Optional[Literal["planned", "completed"]] = None


def _validate_text_fields(values: dict, required: tuple = ()) -> None:
    if any(
        key in required and (not isinstance(value, str) or not value.strip())
        for key, value in values.items()
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Task details cannot be empty.",
        )


def _task_key(body: CalendarTaskRequest) -> str:
    identity = "\n".join(
        value.strip().casefold()
        for value in (body.crop, body.activity, body.timing)
    )
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()


def _task_date(timing: str) -> Optional[str]:
    for candidate in re.findall(r"\b\d{4}-\d{2}-\d{2}\b", timing):
        try:
            return CalendarDate.fromisoformat(candidate).isoformat()
        except ValueError:
            continue
    return None


def _serialize_task(task: dict) -> dict:
    timing = str(task.get("timing") or task.get("date") or "")
    task_date = task.get("date")
    if isinstance(task_date, datetime):
        task_date = task_date.date().isoformat()
    elif isinstance(task_date, CalendarDate):
        task_date = task_date.isoformat()
    elif isinstance(task_date, str):
        try:
            task_date = CalendarDate.fromisoformat(task_date).isoformat()
        except ValueError:
            task_date = _task_date(task_date)
    else:
        task_date = _task_date(timing)

    created_at = task.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()

    return {
        "id": str(task["_id"]),
        "crop": str(task.get("crop") or "Farm task"),
        "activity": str(task.get("activity") or task.get("title") or "Farm task"),
        "timing": timing,
        "reason": str(task.get("reason") or ""),
        "date": task_date,
        "status": "completed" if task.get("status") in ("completed", "done") else "planned",
        "created_at": created_at,
    }


def _get_user_task(user_id: str, task_id: str) -> dict:
    if not ObjectId.is_valid(task_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar task not found.",
        )
    try:
        task = calendar_collection.find_one(
            {"_id": ObjectId(task_id), "user_id": user_id}
        )
    except PyMongoError as exc:
        logger.exception("Could not load calendar task.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Your calendar is temporarily unavailable. Please try again.",
        ) from exc
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar task not found.",
        )
    return task


@router.get("/tasks")
def list_calendar_tasks(
    start: CalendarDate = Query(),
    end: CalendarDate = Query(),
    current_user=Depends(get_current_user),
):
    if end < start:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The end date must be on or after the start date.",
        )
    if (end - start).days > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Please request a shorter calendar date range.",
        )

    user_id = str(current_user["_id"])
    try:
        tasks = list(
            calendar_collection.find(
                {
                    "user_id": user_id,
                    "$or": [
                        {"date": {"$gte": start.isoformat(), "$lte": end.isoformat()}},
                        {"date": {"$in": [None, ""]}},
                        {"date": {"$exists": False}},
                    ],
                }
            ).sort([("date", 1), ("created_at", -1)])
        )
    except PyMongoError as exc:
        logger.exception("Could not load calendar tasks.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Your calendar is temporarily unavailable. Please try again.",
        ) from exc

    return {"tasks": [_serialize_task(task) for task in tasks]}


@router.post("/tasks", status_code=status.HTTP_201_CREATED)
def add_calendar_task(
    body: CalendarTaskRequest,
    current_user=Depends(get_current_user),
):
    _validate_text_fields(
        body.model_dump(),
        required=("crop", "activity", "timing", "reason"),
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

    try:
        saved_task = calendar_collection.find_one(
            {"user_id": user_id, "task_key": task_key}
        )
    except PyMongoError as exc:
        logger.exception("Could not confirm calendar task was saved.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We couldn’t confirm the calendar update. Please refresh and try again.",
        ) from exc

    return {
        "message": "Task added to your calendar."
        if result is not None and result.upserted_id
        else "This task is already in your calendar.",
        "created": result is not None and result.upserted_id is not None,
        "task": _serialize_task(saved_task) if saved_task else None,
    }


@router.patch("/tasks/{task_id}")
def update_calendar_task(
    task_id: str,
    body: CalendarTaskUpdate,
    current_user=Depends(get_current_user),
):
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Provide at least one calendar change.",
        )
    _validate_text_fields(updates, required=("crop", "activity", "timing"))
    if "date" in updates:
        task_date = updates.pop("date")
        updates["date"] = task_date.isoformat() if task_date else None
        if task_date:
            updates["timing"] = task_date.isoformat()
    if "activity" in updates:
        updates["activity"] = updates["activity"].strip()
        updates["title"] = updates["activity"]
    if "crop" in updates:
        updates["crop"] = updates["crop"].strip()
    if "reason" in updates:
        updates["reason"] = updates["reason"].strip()
    if "timing" in updates:
        updates["timing"] = updates["timing"].strip()

    user_id = str(current_user["_id"])
    _get_user_task(user_id, task_id)
    try:
        calendar_collection.update_one(
            {"_id": ObjectId(task_id), "user_id": user_id},
            {"$set": {**updates, "updated_at": datetime.now(timezone.utc)}},
        )
        updated_task = calendar_collection.find_one(
            {"_id": ObjectId(task_id), "user_id": user_id}
        )
    except PyMongoError as exc:
        logger.exception("Could not update calendar task.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We couldn’t update this task. Please try again.",
        ) from exc
    if updated_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar task not found.",
        )
    return {"task": _serialize_task(updated_task)}


@router.delete("/tasks/{task_id}")
def delete_calendar_task(
    task_id: str,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user["_id"])
    _get_user_task(user_id, task_id)
    try:
        result = calendar_collection.delete_one(
            {"_id": ObjectId(task_id), "user_id": user_id}
        )
    except PyMongoError as exc:
        logger.exception("Could not delete calendar task.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We couldn’t delete this task. Please try again.",
        ) from exc
    if not result.deleted_count:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar task not found.",
        )
    return {"deleted": True}
