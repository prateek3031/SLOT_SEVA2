"""App-level user profile, keyed by the stable Clerk user id."""

from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field


class AppUser(BaseModel):
    user_id: str  # Clerk user id ("user_...") — identity is Clerk's, profile is ours
    email: str
    name: str
    role: Literal["patient", "doctor"] = "patient"
    doctor_id: Optional[str] = None  # set when role == "doctor" (email matches a seeded doctor)
    phone: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProfileIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
