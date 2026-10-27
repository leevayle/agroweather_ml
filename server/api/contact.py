import smtplib
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from server.services.contact_service import send_contact_message

router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactMessage(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    message: str = Field(min_length=1, max_length=5000)


@router.post("")
def submit_contact_message(body: ContactMessage):
    name = body.name.strip()
    message = body.message.strip()
    phone = (body.phone or "").strip()
    if not name or not message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Name and message are required.",
        )

    try:
        send_contact_message(
            name=name,
            email=str(body.email),
            phone=phone,
            message=message,
        )
    except (RuntimeError, OSError, smtplib.SMTPException) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Contact message could not be sent. Please try again later.",
        ) from exc

    return {"status": "sent", "message": "Your message has been sent."}
