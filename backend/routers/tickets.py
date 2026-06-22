from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, select
from models.ticket import Ticket
from models.event import Event
from database import get_session
from pydantic import BaseModel
from typing import Optional
import qrcode
import qrcode.image.svg
from PIL import Image, ImageDraw, ImageFont
import io
import os

router = APIRouter(prefix="/tickets", tags=["tickets"])


class TicketCreate(BaseModel):
    event_id: str
    person_name: str
    phone: Optional[str] = None
    email: Optional[str] = None


@router.get("/")
def list_tickets(session: Session = Depends(get_session)):
    tickets = session.exec(select(Ticket)).all()
    return tickets


@router.get("/{ticket_id}")
def get_ticket(ticket_id: str, session: Session = Depends(get_session)):
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket introuvable")
    return ticket


@router.post("/", status_code=201)
def create_ticket(data: TicketCreate, session: Session = Depends(get_session)):
    event = session.get(Event, data.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    ticket = Ticket(**data.model_dump())
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket


@router.get("/{ticket_id}/qr")
def get_ticket_qr(ticket_id: str, session: Session = Depends(get_session)):
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket introuvable")

    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(ticket.qr_code_id)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(content=buf.read(), media_type="image/png")


@router.get("/{ticket_id}/image")
def download_ticket_image(ticket_id: str, session: Session = Depends(get_session)):
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket introuvable")

    event = session.get(Event, ticket.event_id)

    img = Image.new("RGB", (800, 400), color="#1a1a2e")
    draw = ImageDraw.Draw(img)

    draw.text((40, 40), "TICKET", fill="white")
    draw.text((40, 100), event.name if event else "", fill="#e94560")
    draw.text((40, 160), f"Invité : {ticket.person_name}", fill="white")
    draw.text((40, 220), f"ID : {ticket.qr_code_id[:8].upper()}", fill="#aaaaaa")

    qr = qrcode.QRCode(box_size=5, border=2)
    qr.add_data(ticket.qr_code_id)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="white", back_color="#1a1a2e").convert("RGB")
    img.paste(qr_img, (560, 80))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="ticket-{ticket.qr_code_id[:8]}.png"'},
    )


@router.post("/{qr_code_id}/scan")
def scan_ticket(qr_code_id: str, session: Session = Depends(get_session)):
    ticket = session.exec(select(Ticket).where(Ticket.qr_code_id == qr_code_id)).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket invalide")
    if ticket.is_used:
        return {"valid": False, "message": "Ticket déjà utilisé", "ticket": ticket}

    from datetime import datetime
    ticket.is_used = True
    ticket.scanned_at = datetime.utcnow()
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return {"valid": True, "message": "Ticket valide ✓", "ticket": ticket}
