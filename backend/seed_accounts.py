"""One-time: create Clerk accounts for the seeded doctor logins + the demo patient,
so doctor dashboards and the booking flow are testable end to end.
Run: cd /app/backend && python seed_accounts.py
Passwords are recorded in /app/memory/test_credentials.md."""

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

SK = os.environ["CLERK_SECRET_KEY"]
PASSWORD = "SevaDemo#2026"

ACCOUNTS = [
    ("Rajesh Kulkarni", "rajesh.kulkarni@slotseva.in"),
    ("Ananya Sharma", "ananya.sharma@slotseva.in"),
    ("Vikramaditya Sen", "vikramaditya.sen@slotseva.in"),
    ("Meera Nambiar", "meera.nambiar@slotseva.in"),
    ("Arvind Patel", "arvind.patel@slotseva.in"),
    ("Kavitha Reddy", "kavitha.reddy@slotseva.in"),
    ("Sameer Qureshi", "sameer.qureshi@slotseva.in"),
    ("Nandini Iyer", "nandini.iyer@slotseva.in"),
    ("Harpreet Singh", "harpreet.singh@slotseva.in"),
    ("Lakshmi Menon", "lakshmi.menon@slotseva.in"),
    ("Demo Patient", "patient@slotseva.in"),
]


def bapi(path: str, body: dict | None = None):
    url = "https://api.clerk.com/v1" + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method="POST" if body is not None else "GET",
        headers={
            "Authorization": f"Bearer {SK}",
            "Content-Type": "application/json",
            "User-Agent": "emergent-app",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


def main() -> None:
    for name, email in ACCOUNTS:
        first, _, last = name.partition(" ")
        try:
            existing = bapi(f"/users?email_address={urllib.parse.quote(email)}")
            if existing:
                print(f"exists: {email}")
                continue
        except urllib.error.HTTPError as exc:
            print(f"lookup failed {email}: {exc.code} {exc.read().decode()[:120]}")
            continue
        try:
            user = bapi("/users", {
                "email_address": [email],
                "password": PASSWORD,
                "skip_password_checks": True,
                "first_name": first,
                "last_name": last,
            })
            print(f"created: {email} -> {user['id']}")
            time.sleep(0.4)
        except urllib.error.HTTPError as exc:
            print(f"create failed {email}: {exc.code} {exc.read().decode()[:200]}")


if __name__ == "__main__":
    main()
