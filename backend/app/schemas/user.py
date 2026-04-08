from pydantic import BaseModel

from app.models.user import Role


class MeOut(BaseModel):
    id: str
    email: str
    displayName: str | None
    role: Role

