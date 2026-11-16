"""Doctor/clinic catalogue models."""

import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class ClinicWindow(BaseModel):
    """One weekly consulting window. `day`: 0=Mon .. 6=Sun; start/end HH:MM."""
    day: int
    start: str
    end: str


class Doctor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    specialisation: str
    tagline: str = ""
    clinic_name: str
    city: str
    area: str = ""
    address: str = ""
    fee: int  # consultation fee in INR
    experience_years: int = 0
    languages: list[str] = []
    rating: float = 4.5
    reviews: int = 0
    image_url: str = ""
    about: str = ""
    email: str = ""  # login email of the doctor's account (role mapping)
    windows: list[ClinicWindow] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Facet(BaseModel):
    name: str
    count: int


class DoctorMeta(BaseModel):
    doctors: int
    cities: int
    specialisations: int
    specialisation_list: list[Facet] = []
    city_list: list[Facet] = []
    fee_max: int = 0


class Slot(BaseModel):
    time: str  # HH:MM slot start (clinic local)
    status: str  # "open" | "booked" | "past"


class SlotDay(BaseModel):
    doctor_id: str
    date: str
    days: list[str] = []  # bookable day list (server-anchored "today" first)
    slots: list[Slot] = []
