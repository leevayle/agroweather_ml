from email.message import EmailMessage
import smtplib
import ssl

from server.config import (
    CONTACT_EMAIL,
    SMTP_FROM_EMAIL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USERNAME,
)


def send_contact_message(
    *,
    name: str,
    email: str,
    phone: str,
    message: str,
) -> None:
    if not all((CONTACT_EMAIL, SMTP_HOST, SMTP_FROM_EMAIL, SMTP_USERNAME, SMTP_PASSWORD)):
        raise RuntimeError("Authenticated contact email delivery is not configured.")

    mail = EmailMessage()
    mail["Subject"] = "New AgroWeather contact message"
    mail["From"] = SMTP_FROM_EMAIL
    mail["To"] = CONTACT_EMAIL
    mail["Reply-To"] = email
    mail.set_content(
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Phone: {phone or 'Not provided'}\n\n"
        f"Message:\n{message}"
    )

    context = ssl.create_default_context()
    if SMTP_PORT == 465:
        with smtplib.SMTP_SSL(
            SMTP_HOST,
            SMTP_PORT,
            timeout=15,
            context=context,
        ) as server:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(mail)
        return

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(mail)
