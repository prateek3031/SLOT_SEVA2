# SlotSeva Python backend

## Requirements

- Python 3.10+
- MongoDB for application data
- Node.js 20.19+ or 22.12+ and npm for the frontend

## Run locally

From the project root, install the frontend:

```powershell
Set-Location frontend
npm install
npm run dev
```

In another terminal, install and start the backend:

```powershell
Set-Location backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python seed.py
uvicorn server:app --reload --port 8001
```

Run `seed.py` with MongoDB available to load the sample doctor catalog.

The frontend is available at the URL printed by Vite. Its `/api` requests are
proxied to `http://127.0.0.1:8001`. The backend API documentation is at
`http://127.0.0.1:8001/docs`.

Set `MONGO_URL` and `DB_NAME` in `.env` to configure the application database.
The example file uses MongoDB at `localhost:27017`. Clerk auth and AI triage
require their respective credentials to enable those integrations. Without
Clerk keys, doctor browsing remains available and sign-in, booking, and
dashboards display a setup notice. Without the optional AI package or key, chat
uses its built-in keyword fallback.

To enable LLM-powered chat, install `requirements-llm.txt` instead of
`requirements.txt` and set `EMERGENT_LLM_KEY`. The LLM integration is an
optional private package and may require access to its package index.

## Run tests

```powershell
python -m pytest
```

`app.main:app` is also available as a minimal health/readiness service on port
8000. `/health` works without MongoDB; `/health/ready` requires a reachable
MongoDB instance.
