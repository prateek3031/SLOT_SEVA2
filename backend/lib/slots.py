"""Slot generation from a doctor's weekly windows. Times are clinic-local (APP_TZ)."""

import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

SLOT_MINUTES = 30


def clinic_tz() -> ZoneInfo:
    return ZoneInfo(os.environ.get("APP_TZ", "UTC"))


def now_local() -> datetime:
    return datetime.now(clinic_tz())


def _hhmm(t: str) -> tuple[int, int]:
    h, m = t.split(":")
    return int(h), int(m)


def gen_slots(doctor: dict, date_str: str) -> list[str]:
    """All slot START times (HH:MM) the doctor offers on `date_str`, sorted."""
    weekday = datetime.strptime(date_str, "%Y-%m-%d").weekday()  # 0=Mon .. 6=Sun
    out: set[str] = set()
    for w in doctor.get("windows", []):
        if w.get("day") != weekday:
            continue
        h1, m1 = _hhmm(w["start"])
        h2, m2 = _hhmm(w["end"])
        t = datetime(2000, 1, 1, h1, m1)
        end = datetime(2000, 1, 1, h2, m2)
        while t + timedelta(minutes=SLOT_MINUTES) <= end:
            out.add(t.strftime("%H:%M"))
            t += timedelta(minutes=SLOT_MINUTES)
    return sorted(out)
