"""AI triage chat models."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class ChatIn(BaseModel):
    session_id: str  # client-generated conversation id (uuid in localStorage)
    message: str


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    role: str  # "user" | "assistant"
    content: str
    matches: list[str] = []  # recommended doctor ids
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
