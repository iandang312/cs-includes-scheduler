from datetime import datetime

from pydantic import BaseModel, Field


class EventCreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    startAt: datetime
    endAt: datetime
    location: str | None = None
    capacity: int | None = Field(default=None, ge=1)
    syncToGraph: bool = False  # deprecated (Microsoft SSO removed)


class EventOut(BaseModel):
    id: str
    mentorUserId: str
    title: str
    description: str | None
    startAt: datetime
    endAt: datetime
    location: str | None
    capacity: int | None

