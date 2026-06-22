from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Admin(SQLModel, table=True):
    __tablename__ = "admins"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    pin: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
