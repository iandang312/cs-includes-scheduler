from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.integrations.google_calendar import list_google_calendar_events
from app.models.user import User
from app.schemas.calendar import GoogleCalendarFeedOut

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/google", response_model=GoogleCalendarFeedOut)
async def google_calendar_feed(user: User = Depends(get_current_user)) -> GoogleCalendarFeedOut:
    _ = user
    return await list_google_calendar_events()
