from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    date: datetime
    location: Optional[str] = None
    price: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
