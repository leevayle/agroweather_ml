import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

from server.services.auth_service import (
    authenticate_user,
    create_access_token,
    decode_access_token,
    find_user_by_id,
    register_user,
    serialize_user,
    update_user_crops,
    update_user_station,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer(auto_error=False)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str = Field(min_length=1)
    farm_name: str = ""
    location: str = ""
    acres: str = ""
    crops: List[str] = []
    station_code: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CropListUpdateRequest(BaseModel):
    crops: List[str] = Field(default_factory=list)


class StationUpdateRequest(BaseModel):
    station_code: str = Field(min_length=1, max_length=64)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")

    user = find_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    return user


@router.post("/signup", response_model=AuthResponse)
def signup(body: SignupRequest):
    try:
        user = register_user(
            email=body.email,
            password=body.password,
            first_name=body.first_name,
            farm_name=body.farm_name,
            location=body.location,
            acres=body.acres,
            crops=body.crops,
            station_code=body.station_code,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    token = create_access_token(str(user["_id"]), user["email"])
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    try:
        user = authenticate_user(body.email, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    token = create_access_token(str(user["_id"]), user["email"])
    return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return serialize_user(current_user)


@router.put("/me/crops")
def update_my_crops(
    body: CropListUpdateRequest,
    current_user=Depends(get_current_user),
):
    crops = [crop.strip() for crop in body.crops]
    if any(not crop for crop in crops):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Crop names cannot be empty.",
        )

    unique_crops = list({crop.casefold(): crop for crop in crops}.values())
    updated_user = update_user_crops(current_user, unique_crops)
    return serialize_user(updated_user)


@router.put("/me/station")
def update_my_station(
    body: StationUpdateRequest,
    current_user=Depends(get_current_user),
):
    station_code = body.station_code.strip()
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}", station_code):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Enter a valid station code using letters, numbers, hyphens, or underscores.",
        )

    updated_user = update_user_station(current_user, station_code)
    return serialize_user(updated_user)