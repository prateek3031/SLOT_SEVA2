import re
from collections import Counter
from datetime import timedelta

from fastapi import APIRouter, HTTPException

from lib.db import db
from lib.slots import gen_slots, now_local
from models.clinic import Doctor, DoctorMeta, Facet, Slot, SlotDay

router = APIRouter()


def _without_mongo_id(doctor: dict) -> dict:
    doctor.pop("_id", None)
    return doctor


@router.get("/doctors/meta", response_model=DoctorMeta)
async def doctors_meta() -> DoctorMeta:
    doctors = await db.doctors.find(
        {}, {"specialisation": 1, "city": 1, "fee": 1}
    ).to_list(1000)
    specialisations = Counter(
        doctor["specialisation"] for doctor in doctors if doctor.get("specialisation")
    )
    cities = Counter(doctor["city"] for doctor in doctors if doctor.get("city"))
    return DoctorMeta(
        doctors=len(doctors),
        cities=len(cities),
        specialisations=len(specialisations),
        specialisation_list=[
            Facet(name=name, count=count)
            for name, count in sorted(specialisations.items(), key=lambda item: item[0].casefold())
        ],
        city_list=[
            Facet(name=name, count=count)
            for name, count in sorted(cities.items(), key=lambda item: item[0].casefold())
        ],
        fee_max=max((doctor.get("fee", 0) for doctor in doctors), default=0),
    )


@router.get("/doctors", response_model=list[Doctor])
async def list_doctors(
    specialisation: str | None = None,
    city: str | None = None,
    max_fee: int | None = None,
    sort: str = "rating",
    q: str | None = None,
) -> list[Doctor]:
    filters: dict = {}
    if specialisation:
        filters["specialisation"] = specialisation
    if city:
        filters["city"] = city
    if max_fee is not None:
        filters["fee"] = {"$lte": max_fee}
    if q and q.strip():
        pattern = re.escape(q.strip())
        filters["$or"] = [
            {field: {"$regex": pattern, "$options": "i"}}
            for field in ("name", "specialisation", "clinic_name", "city", "area", "tagline")
        ]

    doctors = await db.doctors.find(filters).to_list(1000)
    if sort == "fee_low":
        doctors.sort(key=lambda doctor: (doctor.get("fee", 0), -doctor.get("rating", 0)))
    elif sort == "experience":
        doctors.sort(key=lambda doctor: doctor.get("experience_years", 0), reverse=True)
    else:
        doctors.sort(key=lambda doctor: doctor.get("rating", 0), reverse=True)
    return [Doctor.model_validate(_without_mongo_id(doctor)) for doctor in doctors]


@router.get("/doctors/{doctor_id}/slots", response_model=SlotDay)
async def doctor_slots(doctor_id: str, date: str | None = None) -> SlotDay:
    doctor = await db.doctors.find_one({"id": doctor_id})
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")

    today = now_local()
    days = [(today.date() + timedelta(days=offset)).isoformat() for offset in range(15)]
    selected_date = date or days[0]
    if selected_date not in days:
        raise HTTPException(status_code=422, detail="Pick a date within the next 14 days")

    appointments = await db.appointments.find(
        {
            "doctor_id": doctor_id,
            "date": selected_date,
            "status": {"$in": ["PENDING_PAYMENT", "CONFIRMED"]},
        }
    ).to_list(1000)
    booked = {appointment["time"] for appointment in appointments}
    current_time = today.strftime("%H:%M")
    slots = []
    for time in gen_slots(doctor, selected_date):
        if time in booked:
            status = "booked"
        elif selected_date == days[0] and time <= current_time:
            status = "past"
        else:
            status = "open"
        slots.append(Slot(time=time, status=status))

    return SlotDay(
        doctor_id=doctor_id,
        date=selected_date,
        days=days,
        slots=slots,
    )


@router.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str) -> Doctor:
    doctor = await db.doctors.find_one({"id": doctor_id})
    if doctor is None:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return Doctor.model_validate(_without_mongo_id(doctor))