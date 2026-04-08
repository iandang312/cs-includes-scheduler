import json
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import now_utc
from app.models.oauth_token import OAuthToken


GRAPH_BASE = "https://graph.microsoft.com/v1.0"


def _is_expired(expires_at: datetime) -> bool:
    exp = expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    return exp <= (now_utc() + timedelta(seconds=60))


async def _refresh_access_token(db: Session, tok: OAuthToken) -> OAuthToken:
    if not tok.refresh_token:
        return tok

    token_url = f"{settings.ms_authority}/oauth2/v2.0/token"
    data = {
        "client_id": settings.ms_client_id,
        "client_secret": settings.ms_client_secret,
        "grant_type": "refresh_token",
        "refresh_token": tok.refresh_token,
        "redirect_uri": settings.ms_redirect_uri,
        "scope": settings.ms_scopes,
    }

    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.post(token_url, data=data, headers={"content-type": "application/x-www-form-urlencoded"})
    if res.status_code >= 400:
        return tok
    body = res.json()
    access_token = body.get("access_token")
    expires_in = int(body.get("expires_in", 3600))
    refresh_token = body.get("refresh_token")
    if access_token:
        tok.access_token = access_token
        tok.refresh_token = refresh_token or tok.refresh_token
        tok.expires_at = now_utc().replace(tzinfo=timezone.utc) + timedelta(seconds=expires_in)
        db.add(tok)
        db.commit()
        db.refresh(tok)
    return tok


async def get_graph_access_token(db: Session, user_id) -> str:
    tok = (
        db.query(OAuthToken)
        .filter(OAuthToken.user_id == user_id, OAuthToken.provider == "microsoft")
        .one_or_none()
    )
    if not tok:
        raise HTTPException(status_code=400, detail="No Microsoft token on file for this user")

    if _is_expired(tok.expires_at):
        tok = await _refresh_access_token(db, tok)
    if _is_expired(tok.expires_at):
        raise HTTPException(status_code=401, detail="Microsoft token expired; please sign in again")
    return tok.access_token


async def create_calendar_event(
    db: Session,
    user_id,
    *,
    title: str,
    description: str | None,
    start_at: datetime,
    end_at: datetime,
    location: str | None,
) -> str:
    access_token = await get_graph_access_token(db, user_id)
    payload = {
        "subject": title,
        "body": {"contentType": "text", "content": description or ""},
        "start": {"dateTime": start_at.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end_at.isoformat(), "timeZone": "UTC"},
    }
    if location:
        payload["location"] = {"displayName": location}

    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.post(
            f"{GRAPH_BASE}/me/events",
            headers={"Authorization": f"Bearer {access_token}", "content-type": "application/json"},
            content=json.dumps(payload),
        )
    if res.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to create Graph calendar event")
    body = res.json()
    graph_id = body.get("id")
    if not graph_id:
        raise HTTPException(status_code=502, detail="Graph calendar event missing id")
    return str(graph_id)


async def update_calendar_event(
    db: Session,
    user_id,
    *,
    graph_event_id: str,
    title: str,
    description: str | None,
    start_at: datetime,
    end_at: datetime,
    location: str | None,
) -> None:
    access_token = await get_graph_access_token(db, user_id)
    payload = {
        "subject": title,
        "body": {"contentType": "text", "content": description or ""},
        "start": {"dateTime": start_at.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end_at.isoformat(), "timeZone": "UTC"},
    }
    if location:
        payload["location"] = {"displayName": location}

    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.patch(
            f"{GRAPH_BASE}/me/events/{graph_event_id}",
            headers={"Authorization": f"Bearer {access_token}", "content-type": "application/json"},
            content=json.dumps(payload),
        )
    if res.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to update Graph calendar event")


async def delete_calendar_event(db: Session, user_id, *, graph_event_id: str) -> None:
    access_token = await get_graph_access_token(db, user_id)
    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.delete(
            f"{GRAPH_BASE}/me/events/{graph_event_id}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if res.status_code >= 400:
        raise HTTPException(status_code=502, detail="Failed to delete Graph calendar event")

