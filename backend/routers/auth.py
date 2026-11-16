"""App-user profile routes. Identity is Clerk's (require_user); profile/role is ours."""

import logging
import os

import requests
from fastapi import APIRouter, Depends
from starlette.concurrency import run_in_threadpool

from clerk_auth import require_user
from lib.db import db
from models.user import AppUser, ProfileIn

logger = logging.getLogger(__name__)
router = APIRouter()  # mounted on api_router (which carries the /api prefix)


def _clerk_headers() -> dict:
    return {
        "Authorization": f"Bearer {os.environ.get('CLERK_SECRET_KEY', '')}",
        "User-Agent": "emergent-app",
    }


def _fetch_clerk_profile(user_id: str) -> dict:
    try:
        r = requests.get(
            f"https://api.clerk.com/v1/users/{user_id}",
            headers=_clerk_headers(),
            timeout=10,
        )
        return r.json() if r.ok else {}
    except requests.RequestException:
        return {}


async def current_app_user(user: dict = Depends(require_user)) -> AppUser:
    """The signed-in user's app profile, created on first sight.

    Role mapping: an email matching a seeded doctor's login email makes the
    account a doctor (linked to that doctor profile); everyone else is a patient.
    """
    uid = user["user_id"]
    doc = await db.app_users.find_one({"user_id": uid})
    if doc is None:
        profile = await run_in_threadpool(_fetch_clerk_profile, uid)
        emails = profile.get("email_addresses", [])
        primary_id = profile.get("primary_email_address_id")
        email = ""
        for e in emails:
            if e.get("id") == primary_id:
                email = (e.get("email_address") or "").lower()
        if not email and emails:
            email = (emails[0].get("email_address") or "").lower()
        name = f"{profile.get('first_name') or ''} {profile.get('last_name') or ''}".strip()
        name = name or (email.split("@")[0] if email else "Guest")
        doctor = await db.doctors.find_one({"email": email}) if email else None
        new_user = AppUser(
            user_id=uid,
            email=email,
            name=name,
            role="doctor" if doctor else "patient",
            doctor_id=(doctor["id"] if doctor else None),
        )
        await db.app_users.update_one({"user_id": uid}, {"$set": new_user.model_dump()}, upsert=True)
        doc = new_user.model_dump()
    return AppUser(**doc)


@router.get("/me", response_model=AppUser)
async def me(user: AppUser = Depends(current_app_user)):
    return user


@router.patch("/me", response_model=AppUser)
async def update_me(body: ProfileIn, user: AppUser = Depends(current_app_user)):
    updates = {k: v for k, v in body.model_dump().items() if v not in (None, "")}
    if updates:
        await db.app_users.update_one({"user_id": user.user_id}, {"$set": updates})
    doc = await db.app_users.find_one({"user_id": user.user_id}) or {"user_id": user.user_id}
    merged = AppUser(**{**user.model_dump(), **doc})
    return merged
