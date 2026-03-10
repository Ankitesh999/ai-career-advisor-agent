# AI Career & Placement Intelligence Agent

A full‑stack AI SaaS platform that helps students and placement cells make data‑driven career decisions.  
Built with **FastAPI + PostgreSQL** backend and **Next.js (App Router) + Tailwind** frontend.

---

## Core Capabilities

- Student profile intake (academics, skills, projects, internships)
- AI career analysis (roles, skill gaps, roadmap, salary insights, trends)
- Employability score + placement risk predictor
- Resume AI scanner (PDF/DOCX)
- Company fit predictor
- Role‑based skill gap vs job requirements
- AI career chat assistant
- Internship readiness score + action plan
- Cohort training recommendations
- Industry demand trends (LLM + fallback)
- Placement cell/admin dashboard (read‑only cohort view)

---

## Tech Stack

**Backend**
- FastAPI, SQLAlchemy 2.0, Pydantic v2
- PostgreSQL (psycopg)
- Gemini (google‑genai)
- JWT auth (python‑jose), bcrypt

**Frontend**
- Next.js 14 (App Router), TypeScript
- TailwindCSS, Recharts

---

## Repo Structure

```
ai-career-advisor-agent/
  backend/
  frontend/
  README.md
```

---

## Backend Setup

### 1) Create environment

Copy `.env.example`:

```bash
cd backend
cp .env.example .env
```

Update:

```
DATABASE_URL="postgresql+psycopg://USER:PASSWORD@HOST:PORT/DB"
JWT_SECRET="your-secret"
GEMINI_API_KEY="your-key"
ADMIN_EMAILS="admin@example.com"
```

### 2) Install dependencies

```bash
cd backend
uv sync
```

### 3) Run API

```bash
cd backend
uv run uvicorn main:app --reload
```

API docs: http://127.0.0.1:8000/docs

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

Create `.env.local` if missing:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## Database Tables (Manual SQL)

If you are not using migrations yet, create these tables (in addition to `users`, `student_profiles`, and `career_analyses`):

```sql
-- Employability scores
CREATE TABLE employability_scores (
  id SERIAL PRIMARY KEY,
  student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  academic_strength INTEGER NOT NULL,
  technical_skills INTEGER NOT NULL,
  industry_readiness INTEGER NOT NULL,
  resume_quality INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX employability_scores_profile_id_idx ON employability_scores(student_profile_id);

-- Resume analysis
CREATE TABLE resume_analyses (
  id SERIAL PRIMARY KEY,
  student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  file_name VARCHAR NOT NULL,
  extracted_skills JSON NOT NULL,
  projects JSON NOT NULL,
  experience JSON NOT NULL,
  education JSON NOT NULL,
  resume_score INTEGER NOT NULL,
  missing_keywords JSON NOT NULL,
  weak_sections JSON NOT NULL,
  suggestions JSON NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX resume_analyses_profile_id_idx ON resume_analyses(student_profile_id);

-- Company fit predictor
CREATE TABLE company_fits (
  id SERIAL PRIMARY KEY,
  student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  matches JSON NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX company_fits_profile_id_idx ON company_fits(student_profile_id);

-- Role gap analysis
CREATE TABLE role_gap_analyses (
  id SERIAL PRIMARY KEY,
  student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  role_gaps JSON NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX role_gap_analyses_profile_id_idx ON role_gap_analyses(student_profile_id);

-- Placement risk
CREATE TABLE placement_risks (
  id SERIAL PRIMARY KEY,
  student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  risk_level VARCHAR NOT NULL,
  reasons JSON NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX placement_risks_profile_id_idx ON placement_risks(student_profile_id);

-- Internship readiness
CREATE TABLE internship_readiness (
  id SERIAL PRIMARY KEY,
  student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  readiness_score INTEGER NOT NULL,
  readiness_level VARCHAR NOT NULL,
  action_plan JSON NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX internship_readiness_profile_id_idx ON internship_readiness(student_profile_id);
```

---

## Auth & Roles

- **Login** returns JWT.
- Admin role is derived from `ADMIN_EMAILS` in `.env`.
- `/admin/*` routes require admin JWT (`role=admin`).

---

## Main Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Profiles
- `POST /api/v1/profiles`
- `GET /api/v1/profiles`
- `GET /api/v1/profiles/{id}`
- `PUT /api/v1/profiles/{id}`

### Career Analysis
- `POST /api/v1/analysis/{profile_id}`
- `GET /api/v1/analysis/{profile_id}`

### Employability
- `POST /api/v1/employability/{profile_id}`
- `GET /api/v1/employability/{profile_id}`

### Resume Scanner
- `POST /api/v1/resume/{profile_id}`
- `GET /api/v1/resume/{profile_id}`

### Company Fit
- `POST /api/v1/company-fit/{profile_id}`
- `GET /api/v1/company-fit/{profile_id}`

### Role Gap vs Job Requirement
- `POST /api/v1/role-gaps/{profile_id}`
- `GET /api/v1/role-gaps/{profile_id}`

### Placement Risk
- `POST /api/v1/placement-risk/{profile_id}`
- `GET /api/v1/placement-risk/{profile_id}`

### Internship Readiness
- `POST /api/v1/internship-readiness/{profile_id}`
- `GET /api/v1/internship-readiness/{profile_id}`

### Training Recommendations
- `GET /api/v1/training/recommendations`

### Industry Demand
- `GET /api/v1/industry-demand`

### Admin
- `GET /api/v1/admin/metrics`
- `GET /api/v1/admin/students`

---

## Frontend Pages

- `/` Landing
- `/login`, `/signup`
- `/dashboard` Student dashboard
- `/analysis/[id]` Career dashboard
- `/training` Cohort training recommendations
- `/internship` Internship readiness
- `/resume` Resume scanner
- `/admin/dashboard` Placement cell dashboard

---

## Development Notes

- Gemini free tier has low rate limits; when exhausted, the system falls back to rule‑based logic for some modules.
- AI responses are stored per profile where applicable.
- Admin can view any student’s analysis and metrics.

---

## License

MIT (or choose your preferred license).
