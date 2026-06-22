from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models.event import Event
from database import get_session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])


class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: datetime
    location: Optional[str] = None
    price: Optional[float] = None


@router.get("/")
def list_events(session: Session = Depends(get_session)):
    events = session.exec(select(Event).order_by(Event.date)).all()
    return events


@router.get("/{event_id}")
def get_event(event_id: str, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    return event


@router.post("/", status_code=201)
def create_event(data: EventCreate, session: Session = Depends(get_session)):
    event = Event(**data.model_dump())
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: str, session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    session.delete(event)
    session.commit()
