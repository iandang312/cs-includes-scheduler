import secrets
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from jose import jwt

from app.core.config import settings

# Use PBKDF2 to avoid bcrypt backend/version issues in containers
# and avoid bcrypt's 72-byte password limit.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_state() -> str:
    return secrets.token_urlsafe(24)


def sign_session_jwt(session_id: str) -> str:
    payload = {"sid": session_id}
    return jwt.encode(payload, settings.session_secret, algorithm="HS256")


def verify_session_jwt(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.session_secret, algorithms=["HS256"])
        sid = payload.get("sid")
        if not isinstance(sid, str):
            return None
        return sid
    except Exception:
        return None


def expires_at(ttl_seconds: int) -> datetime:
    return now_utc() + timedelta(seconds=ttl_seconds)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

