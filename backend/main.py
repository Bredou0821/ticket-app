from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import create_db_and_tables
from routers import events, tickets, auth
import os

load_dotenv()

app = FastAPI(title="Ticket- API", version="1.0.0")

_origins_env = os.getenv("ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(tickets.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Ticket- API is running"}
