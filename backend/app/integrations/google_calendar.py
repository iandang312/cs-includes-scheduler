from datetime import datetime, timedelta, timezone
from urllib.parse import quote

import httpx

from app.core.config import settings
from app.schemas.calendar import GoogleCalendarEventOut, GoogleCalendarFeedOut


GOOGLE_CALENDAR_BASE = "https://www.googleapis.com/calendar/v3"


def _parse_google_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _feed_disabled(message: str) -> GoogleCalendarFeedOut:
    return GoogleCalendarFeedOut(enabled=False, connected=False, message=message, events=[])


async def list_google_calendar_events() -> GoogleCalendarFeedOut:
    if not settings.google_calendar_id:
        return _feed_disabled("Set GOOGLE_CALENDAR_ID to load live Google Calendar events.")
    if not settings.google_calendar_api_key:
        return _feed_disabled("Set GOOGLE_CALENDAR_API_KEY to load live Google Calendar events.")

    now = datetime.now(timezone.utc)
    time_min = now.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    time_max = (now + timedelta(days=90)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    calendar_id = quote(settings.google_calendar_id, safe="")
    params = {
        "key": settings.google_calendar_api_key,
        "singleEvents": "true",
        "orderBy": "startTime",
        "timeMin": time_min,
        "timeMax": time_max,
        "maxResults": str(settings.google_calendar_max_results),
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.get(f"{GOOGLE_CALENDAR_BASE}/calendars/{calendar_id}/events", params=params)
    except httpx.HTTPError:
        return GoogleCalendarFeedOut(
            enabled=True,
            connected=False,
            message="Failed to reach Google Calendar. Check network access and your Google Calendar settings.",
            events=[],
        )

    if res.status_code >= 400:
        return GoogleCalendarFeedOut(
            enabled=True,
            connected=False,
            message="Failed to load Google Calendar events. Check the calendar ID, API key, and calendar visibility.",
            events=[],
        )

    items = res.json().get("items", [])
    events: list[GoogleCalendarEventOut] = []
    for item in items:
        start = item.get("start", {})
        end = item.get("end", {})
        start_at = _parse_google_datetime(start.get("dateTime")) or _parse_google_datetime(start.get("date"))
        end_at = _parse_google_datetime(end.get("dateTime")) or _parse_google_datetime(end.get("date"))
        if start_at is None:
            continue
        events.append(
            GoogleCalendarEventOut(
                id=str(item.get("id", "")),
                title=str(item.get("summary") or "Untitled event"),
                description=item.get("description"),
                startAt=start_at,
                endAt=end_at,
                location=item.get("location"),
                htmlLink=item.get("htmlLink"),
                status=str(item.get("status") or "confirmed"),
            )
        )

    return GoogleCalendarFeedOut(enabled=True, connected=True, events=events)
