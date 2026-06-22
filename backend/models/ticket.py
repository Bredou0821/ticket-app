from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Ticket(SQLModel, table=True):
    __tablename__ = "tickets"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    event_id: str = Field(foreign_key="events.id", index=True)
    person_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    qr_code_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    is_used: bool = Field(default=False)
    scanned_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
