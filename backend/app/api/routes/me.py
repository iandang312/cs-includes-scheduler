from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.user import MeOut
from app.models.user import User

router = APIRouter()


@router.get("/me", response_model=MeOut)
def get_me(user: User = Depends(get_current_user)) -> MeOut:
    return MeOut(id=str(user.id), email=user.email, displayName=user.display_name, role=user.role)

