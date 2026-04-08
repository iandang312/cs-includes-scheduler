from datetime import datetime

from pydantic import BaseModel, Field


class GoogleCalendarEventOut(BaseModel):
    id: str
    title: str
    description: str | None
    startAt: datetime
    endAt: datetime | None
    location: str | None
    htmlLink: str | None
    status: str


class GoogleCalendarFeedOut(BaseModel):
    enabled: bool
    connected: bool
    message: str | None = None
    events: list[GoogleCalendarEventOut] = Field(default_factory=list)
