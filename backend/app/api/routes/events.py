import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_mentor
from app.db.session import get_db
from app.models.event import Event
from app.models.rsvp import Rsvp, RsvpStatus
from app.models.user import User
from app.schemas.event import EventCreateIn, EventOut
from app.schemas.rsvp import MyRsvpOut, RsvpIn

router = APIRouter(tags=["events"])


def _event_out(e: Event) -> EventOut:
    return EventOut(
        id=str(e.id),
        mentorUserId=str(e.mentor_user_id),
        title=e.title,
        description=e.description,
        startAt=e.start_at,
        endAt=e.end_at,
        location=e.location,
        capacity=e.capacity,
    )


@router.get("/events", response_model=list[EventOut])
def list_events(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[EventOut]:
    # MVP:
    # - mentees can browse all events
    # - mentors see only events they own (admin sees all)
    stmt = select(Event).order_by(Event.start_at.asc())
    if user.role == "mentor":
        stmt = stmt.where(Event.mentor_user_id == user.id)
    rows = db.execute(stmt).scalars().all()
    return [_event_out(e) for e in rows]


@router.get("/events/{event_id}", response_model=EventOut)
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> EventOut:
    try:
        eid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    e = db.get(Event, eid)
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    return _event_out(e)


@router.post("/events", response_model=EventOut)
async def create_event(
    payload: EventCreateIn,
    db: Session = Depends(get_db),
    mentor: User = Depends(require_mentor),
) -> EventOut:
    if payload.endAt <= payload.startAt:
        raise HTTPException(status_code=400, detail="endAt must be after startAt")

    e = Event(
        mentor_user_id=mentor.id,
        title=payload.title,
        description=payload.description,
        start_at=payload.startAt,
        end_at=payload.endAt,
        location=payload.location,
        capacity=payload.capacity,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return _event_out(e)


@router.post("/events/{event_id}/rsvp")
def rsvp(
    event_id: str,
    payload: RsvpIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        eid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    e = db.get(Event, eid)
    if not e:
        raise HTTPException(status_code=404, detail="Not found")

    row = db.execute(select(Rsvp).where(Rsvp.event_id == eid, Rsvp.user_id == user.id)).scalar_one_or_none()
    if payload.status == RsvpStatus.going and e.capacity is not None:
        already_going = row is not None and row.status == RsvpStatus.going
        if not already_going:
            going_count = db.execute(
                select(func.count())
                .select_from(Rsvp)
                .where(Rsvp.event_id == eid, Rsvp.status == RsvpStatus.going)
            ).scalar_one()
            if int(going_count) >= int(e.capacity):
                raise HTTPException(status_code=409, detail="Event is full")
    if not row:
        row = Rsvp(event_id=eid, user_id=user.id, status=payload.status)
        db.add(row)
    else:
        row.status = payload.status
    db.commit()
    return {"ok": True}


@router.get("/me/rsvps", response_model=list[MyRsvpOut])
def my_rsvps(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[MyRsvpOut]:
    rows = db.execute(select(Rsvp).where(Rsvp.user_id == user.id)).scalars().all()
    return [MyRsvpOut(eventId=str(r.event_id), status=r.status) for r in rows]


@router.get("/events/{event_id}/attendees")
def event_attendees(
    event_id: str,
    db: Session = Depends(get_db),
    mentor: User = Depends(require_mentor),
):
    try:
        eid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    e = db.get(Event, eid)
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    if e.mentor_user_id != mentor.id and mentor.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    # Only attendees for this event; do not expose other data.
    rows = db.execute(
        select(Rsvp, User).join(User, User.id == Rsvp.user_id).where(Rsvp.event_id == eid, Rsvp.status == RsvpStatus.going)
    ).all()

    return [
        {"userId": str(u.id), "email": u.email, "displayName": u.display_name}
        for (r, u) in rows
    ]


@router.patch("/events/{event_id}", response_model=EventOut)
async def update_event(
    event_id: str,
    payload: EventCreateIn,
    db: Session = Depends(get_db),
    mentor: User = Depends(require_mentor),
) -> EventOut:
    try:
        eid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    e = db.get(Event, eid)
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    if e.mentor_user_id != mentor.id and mentor.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if payload.endAt <= payload.startAt:
        raise HTTPException(status_code=400, detail="endAt must be after startAt")

    e.title = payload.title
    e.description = payload.description
    e.start_at = payload.startAt
    e.end_at = payload.endAt
    e.location = payload.location
    e.capacity = payload.capacity
    db.commit()
    db.refresh(e)
    return _event_out(e)


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    mentor: User = Depends(require_mentor),
):
    try:
        eid = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    e = db.get(Event, eid)
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    if e.mentor_user_id != mentor.id and mentor.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    db.delete(e)
    db.commit()
    return {"ok": True}

