"""Appointment + demo-payment models."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field

ApptStatus = Literal["PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED"]


class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str  # YYYY-MM-DD (clinic local time)
    time: str  # HH:MM (clinic local time)
    patient_name: str
    patient_phone: str = ""


class PayIn(BaseModel):
    payment_mode: Literal["UPI", "CARD", "NETBANKING"]


class StatusIn(BaseModel):
    status: Literal["COMPLETED", "CANCELLED"]


class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reference: str  # human booking reference, e.g. SS-2026-4821
    doctor_id: str
    doctor_name: str
    doctor_specialisation: str
    clinic_name: str
    clinic_city: str
    image_url: str = ""
    patient_user_id: str
    patient_name: str
    patient_phone: str = ""
    date: str
    time: str
    status: ApptStatus = "PENDING_PAYMENT"
    amount: int  # INR
    payment_mode: str = ""
    payment_status: str = ""  # "MOCKED-PAID" once the demo checkout confirms
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AppointmentList(BaseModel):
    today: str  # server-anchored "today" (clinic timezone) so clients never do date math
    appointments: list[Appointment]
