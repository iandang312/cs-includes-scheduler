import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import Role, User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    rows = db.execute(select(User).order_by(User.created_at.desc())).scalars().all()
    return [
        {"id": str(u.id), "email": u.email, "displayName": u.display_name, "role": u.role}
        for u in rows
    ]


@router.post("/users/{user_id}/role")
def set_role(
    user_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    role_raw = payload.get("role")
    if role_raw not in {r.value for r in Role}:
        raise HTTPException(status_code=400, detail="Invalid role")
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    u = db.get(User, uid)
    if not u:
        raise HTTPException(status_code=404, detail="Not found")
    u.role = Role(role_raw)
    db.commit()
    return {"ok": True}

