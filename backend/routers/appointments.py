"""Booking + demo checkout. Appointments are created PENDING_PAYMENT, then a MOCKED
payment flips them to CONFIRMED (no real money is ever involved)."""

import logging
import random
import re
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException

from lib.db import db
from lib.slots import gen_slots, now_local
from models.appointment import Appointment, AppointmentCreate, AppointmentList, PayIn, StatusIn
from routers.auth import current_app_user
from models.user import AppUser

logger = logging.getLogger(__name__)
router = APIRouter()  # mounted on api_router (which carries the /api prefix)

ACTIVE_STATUSES = ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED"]
BOOKABLE_WINDOW_DAYS = 14


def _fix(doc: dict) -> dict:
    """Motor returns naive UTC datetimes — re-tag them aware so Pydantic serialises an offset."""
    for key in ("created_at", "updated_at"):
        value = doc.get(key)
        if isinstance(value, datetime) and value.tzinfo is None:
            doc[key] = value.replace(tzinfo=timezone.utc)
    return doc


async def _new_reference() -> str:
    year = now_local().year
    for _ in range(6):
        ref = f"SS-{year}-{random.randint(1000, 9999)}"
        if not await db.appointments.find_one({"reference": ref}):
            return ref
    return f"SS-{year}-{random.randint(10000, 99999)}"


@router.post("/appointments", response_model=Appointment)
async def create_appointment(body: AppointmentCreate, user: AppUser = Depends(current_app_user)):
    if user.role == "doctor":
        raise HTTPException(status_code=403, detail="Doctor accounts cannot book consultations")
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", body.date) or not re.match(r"^\d{2}:\d{2}$", body.time):
        raise HTTPException(status_code=422, detail="date must be YYYY-MM-DD and time HH:MM")

    doctor = await db.doctors.find_one({"id": body.doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    today = now_local().strftime("%Y-%m-%d")
    try:
        chosen = datetime.strptime(body.date, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Invalid date") from exc
    if chosen < datetime.strptime(today, "%Y-%m-%d").date() or chosen > datetime.strptime(today, "%Y-%m-%d").date() + timedelta(days=BOOKABLE_WINDOW_DAYS):
        raise HTTPException(status_code=422, detail="Pick a date within the next 14 days")

    if body.time not in gen_slots(doctor, body.date):
        raise HTTPException(status_code=409, detail="Doctor does not consult at that time")

    clash = await db.appointments.find_one({
        "doctor_id": body.doctor_id,
        "date": body.date,
        "time": body.time,
        "status": {"$in": ["PENDING_PAYMENT", "CONFIRMED"]},
    })
    if clash:
        raise HTTPException(status_code=409, detail="That slot was just booked — pick another")

    appt = Appointment(
        reference=await _new_reference(),
        doctor_id=doctor["id"],
        doctor_name=doctor["name"],
        doctor_specialisation=doctor["specialisation"],
        clinic_name=doctor["clinic_name"],
        clinic_city=doctor["city"],
        image_url=doctor.get("image_url", ""),
        patient_user_id=user.user_id,
        patient_name=body.patient_name.strip() or user.name,
        patient_phone=body.patient_phone.strip(),
        date=body.date,
        time=body.time,
        amount=doctor["fee"],
    )
    await db.appointments.insert_one(appt.model_dump())
    return appt


@router.post("/appointments/{appointment_id}/pay", response_model=Appointment)
async def pay_appointment(appointment_id: str, body: PayIn, user: AppUser = Depends(current_app_user)):
    doc = await db.appointments.find_one({"id": appointment_id, "patient_user_id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if doc["status"] not in ("PENDING_PAYMENT", "CONFIRMED"):
        raise HTTPException(status_code=409, detail="This appointment can no longer be paid for")

    updated = await db.appointments.find_one_and_update(
        {"id": appointment_id},
        {"$set": {
            "status": "CONFIRMED",
            "payment_mode": body.payment_mode,
            "payment_status": "MOCKED-PAID",
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    return Appointment(**_fix(updated))


@router.get("/appointments", response_model=AppointmentList)
async def list_appointments(user: AppUser = Depends(current_app_user)):
    if user.role == "doctor":
        query = {"doctor_id": user.doctor_id} if user.doctor_id else {"doctor_id": "__none__"}
    else:
        query = {"patient_user_id": user.user_id}
    docs = await db.appointments.find(query).sort([("date", 1), ("time", 1)]).to_list(1000)
    return AppointmentList(
        today=now_local().strftime("%Y-%m-%d"),
        appointments=[Appointment(**_fix(d)) for d in docs],
    )


@router.post("/appointments/{appointment_id}/cancel", response_model=Appointment)
async def cancel_appointment(appointment_id: str, user: AppUser = Depends(current_app_user)):
    query = {"id": appointment_id, "patient_user_id": user.user_id}
    doc = await db.appointments.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if doc["status"] not in ("PENDING_PAYMENT", "CONFIRMED"):
        raise HTTPException(status_code=409, detail="Only active appointments can be cancelled")
    updated = await db.appointments.find_one_and_update(
        {"id": appointment_id},
        {"$set": {"status": "CANCELLED", "updated_at": datetime.now(timezone.utc)}},
    )
    return Appointment(**_fix(updated))


@router.patch("/appointments/{appointment_id}/status", response_model=Appointment)
async def set_appointment_status(
    appointment_id: str,
    body: StatusIn,
    user: AppUser = Depends(current_app_user),
):
    if user.role != "doctor" or not user.doctor_id:
        raise HTTPException(status_code=403, detail="Only the treating doctor can update status")
    doc = await db.appointments.find_one({"id": appointment_id, "doctor_id": user.doctor_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if body.status == "COMPLETED" and doc["status"] not in ("CONFIRMED",):
        raise HTTPException(status_code=409, detail="Only confirmed consultations can be completed")
    if body.status == "CANCELLED" and doc["status"] not in ("PENDING_PAYMENT", "CONFIRMED"):
        raise HTTPException(status_code=409, detail="Only active appointments can be cancelled")
    updated = await db.appointments.find_one_and_update(
        {"id": appointment_id},
        {"$set": {"status": body.status, "updated_at": datetime.now(timezone.utc)}},
    )
    return Appointment(**_fix(updated))
