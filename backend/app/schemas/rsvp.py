from pydantic import BaseModel

from app.models.rsvp import RsvpStatus


class RsvpIn(BaseModel):
    status: RsvpStatus


class MyRsvpOut(BaseModel):
    eventId: str
    status: RsvpStatus

