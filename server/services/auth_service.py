from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from jose import JWTError, jwt
from passlib.context import CryptContext

from server.config import JWT_ALGORITHM, JWT_EXPIRE_MINUTES, JWT_SECRET
from server.database.mongodb import users_collection

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None


def serialize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    created = user.get("created_at")
    if isinstance(created, datetime):
        created = created.isoformat()

    return {
        "id": str(user["_id"]),
        "email": user.get("email"),
        "first_name": user.get("first_name"),
        "farm_name": user.get("farm_name"),
        "location": user.get("location"),
        "acres": user.get("acres"),
        "crops": user.get("crops") or [],
        "station_code": user.get("station_code"),
        "created_at": created,
    }


def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    return users_collection.find_one({"email": email.lower().strip()})


def find_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        return users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def register_user(
    *,
    email: str,
    password: str,
    first_name: str,
    farm_name: str = "",
    location: str = "",
    acres: str = "",
    crops: Optional[List[str]] = None,
    station_code: Optional[str] = None,
) -> Dict[str, Any]:
    normalized_email = email.lower().strip()

    if find_user_by_email(normalized_email):
        raise ValueError("An account with this email already exists.")

    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")

    now = datetime.now(timezone.utc)
    document = {
        "email": normalized_email,
        "password_hash": hash_password(password),
        "first_name": first_name.strip(),
        "farm_name": (farm_name or "").strip(),
        "location": (location or "").strip(),
        "acres": (acres or "").strip(),
        "crops": crops or [],
        "station_code": station_code,
        "created_at": now,
        "updated_at": now,
    }

    result = users_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return document


def update_user_crops(
    user: Dict[str, Any],
    crops: List[str],
) -> Dict[str, Any]:
    updated_at = datetime.now(timezone.utc)
    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "crops": crops,
                "updated_at": updated_at,
            },
        },
    )
    updated_user = user.copy()
    updated_user["crops"] = crops
    updated_user["updated_at"] = updated_at
    return updated_user


def update_user_station(
    user: Dict[str, Any],
    station_code: str,
) -> Dict[str, Any]:
    updated_at = datetime.now(timezone.utc)
    result = users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "station_code": station_code,
                "updated_at": updated_at,
            },
        },
    )
    if result.matched_count != 1:
        raise RuntimeError("Could not save the selected weather station.")
    updated_user = user.copy()
    updated_user["station_code"] = station_code
    updated_user["updated_at"] = updated_at
    return updated_user


def authenticate_user(email: str, password: str) -> Dict[str, Any]:
    user = find_user_by_email(email)
    if not user:
        raise ValueError("Invalid email or password.")
    if not verify_password(password, user.get("password_hash", "")):
        raise ValueError("Invalid email or password.")
    return user