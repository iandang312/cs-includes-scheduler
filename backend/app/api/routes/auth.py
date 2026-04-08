import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import expires_at, hash_password, now_utc, sign_session_jwt, verify_password
from app.db.session import get_db
from app.models.session import Session as DbSession
from app.models.user import Role, User

router = APIRouter(prefix="/auth", tags=["auth"])


def _admin_email_set() -> set[str]:
    raw = settings.admin_emails.strip()
    if not raw:
        return set()
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


@router.post("/register")
def register(payload: dict, db: Session = Depends(get_db)):
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    display_name = payload.get("displayName")

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = db.query(User).filter(User.email == email).one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(password),
        display_name=str(display_name).strip() if display_name else None,
        role=Role.admin if email in _admin_email_set() else Role.mentee,
    )
    user.last_login_at = now_utc()
    db.add(user)
    db.flush()

    sess = DbSession(id=uuid.uuid4(), user_id=user.id, expires_at=expires_at(settings.session_ttl_seconds))
    db.add(sess)
    db.commit()

    cookie_value = sign_session_jwt(str(sess.id))
    resp = Response(status_code=200, content=json.dumps({"ok": True}), media_type="application/json")
    resp.set_cookie(
        key=settings.session_cookie_name,
        value=cookie_value,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.session_ttl_seconds,
        path="/",
    )
    return resp


@router.post("/login")
def password_login(payload: dict, db: Session = Depends(get_db)):
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    user = db.query(User).filter(User.email == email).one_or_none()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_login_at = now_utc()
    if user.role != Role.admin and email in _admin_email_set():
        user.role = Role.admin

    sess = DbSession(id=uuid.uuid4(), user_id=user.id, expires_at=expires_at(settings.session_ttl_seconds))
    db.add(sess)
    db.commit()

    cookie_value = sign_session_jwt(str(sess.id))
    resp = Response(status_code=200, content=json.dumps({"ok": True}), media_type="application/json")
    resp.set_cookie(
        key=settings.session_cookie_name,
        value=cookie_value,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.session_ttl_seconds,
        path="/",
    )
    return resp


@router.post("/logout")
def logout(resp: Response):
    resp = Response(status_code=200, content=json.dumps({"ok": True}), media_type="application/json")
    resp.delete_cookie(settings.session_cookie_name, path="/")
    return resp

