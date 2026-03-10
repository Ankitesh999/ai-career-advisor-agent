# AI Career Intelligence Agent (Backend)

Production-ready FastAPI backend scaffold for an AI SaaS application.

## Tech
- Python + FastAPI
- `uv` (package/dependency manager)
- PostgreSQL + SQLAlchemy
- Pydantic (request/response validation)
- `python-dotenv` (local env loading)

## Local setup
### 1) Prereqs
- Python 3.11+
- PostgreSQL running locally
- `uv` installed

### 2) Configure env
From `backend/`:
1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` for your Postgres instance

### 3) Install dependencies
From `backend/`:
```bash
uv sync
```

### 4) Run API
From `backend/`:
```bash
uv run uvicorn main:app --reload
```

Open:
- API docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## Quick API tour
- `GET /health` – service health
- `POST /api/v1/users` – create a user (example)
- `GET /api/v1/users/{user_id}` – fetch a user (example)

## Tests
From `backend/`:
```bash
uv run pytest
```

## Project structure
```
backend/
  app/
    api/        # HTTP routes + dependencies
    core/       # settings + app factory
    db/         # DB engine/session/base
    models/     # SQLAlchemy models
    schemas/    # Pydantic schemas
    services/   # business logic
    utils/      # helpers
  tests/        # pytest tests
  main.py       # app entrypoint
  pyproject.toml
  .env.example
  README.md
```
