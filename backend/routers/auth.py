from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
from auth import verify_password, hash_password, create_token
from database import get_session
from models.admin import Admin

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginInput(BaseModel):
    email: str
    password: str


class PinInput(BaseModel):
    pin: str


class SetupInput(BaseModel):
    email: str
    password: str
    pin: str


@router.post("/login")
def login(data: LoginInput, session: Session = Depends(get_session)):
    admin = session.exec(select(Admin).where(Admin.email == data.email)).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    return {"access_token": create_token(), "token_type": "bearer"}


@router.post("/pin")
def verify_pin(data: PinInput, session: Session = Depends(get_session)):
    admin = session.exec(select(Admin)).first()
    if not admin or data.pin != admin.pin:
        raise HTTPException(status_code=401, detail="Code PIN incorrect")
    return {"access_token": create_token(), "token_type": "bearer"}


@router.post("/setup")
def setup(data: SetupInput, session: Session = Depends(get_session)):
    """Crée le compte admin — utilisable une seule fois."""
    existing = session.exec(select(Admin)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin déjà configuré")
    admin = Admin(
        email=data.email,
        password_hash=hash_password(data.password),
        pin=data.pin,
    )
    session.add(admin)
    session.commit()
    return {"message": "Admin créé avec succès"}
