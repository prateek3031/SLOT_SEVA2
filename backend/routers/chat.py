"""AI symptom triage: streams the reply over SSE (emergentintegrations, gpt-5.4) and
recommends matching doctors from the live catalog. Keyword fallback keeps the feature
alive if the LLM key is missing or the call fails."""

import json
import logging
import os
import re
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

try:
    import emergentintegrations.llm.chat as llm_chat
except ImportError:
    llm_chat = None

from lib.db import db
from models.chat import ChatIn, ChatMessage

logger = logging.getLogger(__name__)
router = APIRouter()  # mounted on api_router (which carries the /api prefix)

EMERGENCY_HINTS = re.compile(r"\b108\b|emergency|nearest er|call an ambulance", re.IGNORECASE)

FALLBACK_RULES = [
    (["chest", "heart", "palpitation", "cardiac", "blood pressure"], "Cardiologist"),
    (["skin", "rash", "acne", "hair", "itch", "eczema"], "Dermatologist"),
    (["child", "kid", "baby", "infant", "vaccin", "newborn"], "Pediatrician"),
    (["bone", "joint", "knee", "back pain", "fracture", "sprain", "shoulder", "posture"], "Orthopaedics & Sports Medicine"),
    (["ear", "throat", "nose", "sinus", "snoring", "hearing", "tonsil"], "ENT Specialist"),
    (["period", "pregnan", "pcos", "menstrual", "uterus", "gynae", "ivf"], "Gynaecologist"),
    (["headache", "migraine", "numbness", "seizure", "stroke", "dizzy", "vertigo", "tingling"], "Neurologist"),
    (["fever", "cold", "cough", "flu", "vomit", "stomach", "diabetes", "thyroid", "tired", "weakness"], "General Physician"),
]


def _catalog_lines(doctors: list[dict]) -> str:
    lines = []
    for d in doctors:
        lines.append(
            f'- id: {d["id"]} | {d["name"]} | {d["specialisation"]} | clinic: {d["clinic_name"]}, '
            f'{d.get("area", "")}, {d["city"]} | fee: Rs.{d["fee"]} | rating: {d.get("rating")} | '
            f'expertise: {d.get("tagline", "")}'
        )
    return "\n".join(lines)


def _system_prompt(catalog: str) -> str:
    return f"""You are the SLOT SEVA symptom-triage assistant for a local-clinic appointment booking service in India.

DOCTOR CATALOG:
{catalog}

RULES:
1. The user describes a health problem in chat. Identify the medical specialisation needed.
2. Recommend the 1-3 best-matching doctor ids from the catalog (prefer the matching specialisation, then the user's city if they mention one, then higher rating). Use ONLY ids that appear in the catalog.
3. Reply in 2-5 short, plain-text sentences (no markdown, no lists). Warm but crisp. Say which doctor(s) you picked and why, in one clause. Fees are in rupees.
4. If the symptoms suggest an emergency (crushing chest pain with breathlessness or sweating, stroke signs, heavy bleeding, unconsciousness, seizures), say so FIRST and tell the user to call 108 or go to the nearest ER instead of booking online.
5. Never give a definitive diagnosis or prescribe medicine. You recommend which doctor to see.
6. VERY IMPORTANT: end your reply with exactly one final line in this exact format so the system can parse the recommendations:
<<<MATCHES>>>["doctor-id-1","doctor-id-2"]"""


def _split_matches(text: str) -> tuple[str, list[str]]:
    marker = "<<<MATCHES>>>"
    idx = text.rfind(marker)
    reply, matches = text.strip(), []
    if idx >= 0:
        reply = text[:idx].strip()
        raw = text[idx + len(marker):].strip().strip("`").strip()
        m = re.search(r"\[[^\]]*\]", raw, re.DOTALL)
        if m:
            try:
                parsed = json.loads(m.group(0))
                if isinstance(parsed, list):
                    matches = [str(x) for x in parsed]
            except json.JSONDecodeError:
                matches = []
    return reply, matches


def _fallback(message: str, doctors: list[dict]) -> tuple[str, list[str]]:
    msg = message.lower()
    spec = "General Physician"
    for keys, s in FALLBACK_RULES:
        if any(k in msg for k in keys):
            spec = s
            break
    matched = [d for d in doctors if d["specialisation"] == spec]
    matched.sort(key=lambda d: d.get("rating", 0), reverse=True)
    ids = [d["id"] for d in matched[:3]]
    names = ", ".join(d["name"] for d in matched[:2]) if matched else "a nearby clinic on SLOT SEVA"
    reply = (
        f"TRIAGE // Based on what you described, I'd start with a {spec}. "
        f"In our network that's {names} — open their card to pick a slot. "
        "If this feels like an emergency, call 108 instead of waiting for an appointment."
    )
    return reply, ids


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


def _mini(d: dict) -> dict:
    return {
        "id": d["id"],
        "name": d["name"],
        "specialisation": d["specialisation"],
        "city": d["city"],
        "area": d.get("area", ""),
        "fee": d["fee"],
        "rating": d.get("rating", 4.5),
        "image_url": d.get("image_url", ""),
    }


def _fix(d: dict) -> dict:
    v = d.get("created_at")
    if isinstance(v, datetime) and v.tzinfo is None:
        d["created_at"] = v.replace(tzinfo=timezone.utc)
    return d


@router.post("/chat/stream")
async def chat_stream(body: ChatIn):
    async def event_stream():
        doctors = await db.doctors.find({}).to_list(300)
        catalog = _catalog_lines(doctors)
        history = await db.chat_messages.find({"session_id": body.session_id}).sort("created_at", 1).to_list(20)
        history_text = "\n".join(f"{m['role'].upper()}: {m['content'][:400]}" for m in history[-8:])
        prompt = (
            f"CONVERSATION SO FAR:\n{history_text}\n\nNEW MESSAGE:\n{body.message}"
            if history_text
            else body.message
        )

        yield _sse({"type": "start"})
        full = ""
        api_key = os.environ.get("EMERGENT_LLM_KEY", "")
        llm_ok = bool(api_key and llm_chat is not None)
        if llm_ok:
            try:
                chat = llm_chat.LlmChat(
                    api_key=api_key,
                    session_id=f"ss-{body.session_id}"[:64],
                    system_message=_system_prompt(catalog),
                ).with_model("openai", "gpt-5.4")
                async for event in chat.stream_message(llm_chat.UserMessage(text=prompt)):
                    if isinstance(event, llm_chat.TextDelta):
                        full += event.content
                        yield _sse({"type": "delta", "content": event.content})
                    elif isinstance(event, llm_chat.StreamDone):
                        break
            except Exception as exc:
                logger.error("triage llm failed: %s", exc)
                llm_ok = False

        if llm_ok and full.strip():
            reply, match_ids = _split_matches(full)
        else:
            reply, match_ids = _fallback(body.message, doctors)

        valid_ids = {d["id"] for d in doctors}
        matched = [d for d in doctors if d["id"] in set(match_ids) & valid_ids]
        if not matched:  # LLM reply missing/unparseable — never leave the user without options
            reply, match_ids = _fallback(body.message, doctors)
            matched = [d for d in doctors if d["id"] in set(match_ids)]

        urgency = "emergency" if EMERGENCY_HINTS.search(reply) else "routine"

        for content, role, matches in (
            (body.message, "user", []),
            (reply, "assistant", match_ids),
        ):
            msg = ChatMessage(session_id=body.session_id, role=role, content=content, matches=matches)
            await db.chat_messages.insert_one(msg.model_dump())

        yield _sse({"type": "done", "urgency": urgency, "reply": reply, "matches": [_mini(d) for d in matched[:3]]})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@router.get("/chat/history", response_model=list[ChatMessage])
async def chat_history(session_id: str):
    docs = await db.chat_messages.find({"session_id": session_id}).sort("created_at", 1).to_list(50)
    return [ChatMessage(**_fix(d)) for d in docs]
