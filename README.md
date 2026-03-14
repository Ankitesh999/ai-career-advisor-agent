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

### 4) Apply one-time user type patch (existing DBs)

```bash
cd backend
psql "postgresql://USER:PASSWORD@HOST:PORT/DB" -f sql/2026-03-15_add_user_student_type.sql
```

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

If you are not using migrations yet, run this SQL:

```sql
-- 1. USERS table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    student_type VARCHAR(20) NOT NULL DEFAULT 'college_student',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT users_student_type_check
      CHECK (student_type IN ('twelfth_student', 'college_student'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. STUDENT_PROFILES table
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    twelfth_percentage DOUBLE PRECISION NOT NULL,
    cgpa DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    degree VARCHAR(200) NOT NULL,
    specialization VARCHAR(200) NOT NULL,
    current_skills JSONB NOT NULL DEFAULT '[]',
    interests JSONB NOT NULL DEFAULT '[]',
    target_industry VARCHAR(200) NOT NULL,
    projects INTEGER NOT NULL DEFAULT 0,
    internships INTEGER NOT NULL DEFAULT 0,
    certifications INTEGER NOT NULL DEFAULT 0,
    subjects JSONB DEFAULT '[]',
    math_strength VARCHAR(20),
    logical_reasoning VARCHAR(20),
    programming_interest VARCHAR(20),
    user_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT student_profiles_user_type_check
      CHECK (user_type IS NULL OR user_type IN ('twelfth_student', 'college_student'))
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);

-- 3. EMPLOYABILITY_SCORES table
CREATE TABLE IF NOT EXISTS employability_scores (
    id SERIAL PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    academic_strength INTEGER NOT NULL,
    technical_skills INTEGER NOT NULL,
    industry_readiness INTEGER NOT NULL,
    resume_quality INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employability_scores_student_profile_id ON employability_scores(student_profile_id);

-- 4. CAREER_ANALYSES table
CREATE TABLE IF NOT EXISTS career_analyses (
    id SERIAL PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    career_recommendations JSONB NOT NULL DEFAULT '[]',
    skill_gaps JSONB NOT NULL DEFAULT '[]',
    learning_roadmap JSONB NOT NULL DEFAULT '[]',
    salary_insights JSONB NOT NULL DEFAULT '{}',
    industry_trends JSONB NOT NULL DEFAULT '[]',
    aiml_score INTEGER,
    cyber_security_score INTEGER,
    recommended_branch VARCHAR(50),
    branch_reasoning JSONB,
    aiml_roles JSONB,
    cyber_roles JSONB,
    aiml_skills JSONB,
    cyber_skills JSONB,
    aiml_roadmap JSONB,
    cyber_roadmap JSONB,
    industry_insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_analyses_student_profile_id ON career_analyses(student_profile_id);

-- 5. INTERNSHIP_READINESS table
CREATE TABLE IF NOT EXISTS internship_readiness (
    id SERIAL PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    readiness_score INTEGER NOT NULL,
    readiness_level VARCHAR NOT NULL,
    action_plan JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internship_readiness_student_profile_id ON internship_readiness(student_profile_id);

-- 6. PLACEMENT_RISKS table
CREATE TABLE IF NOT EXISTS placement_risks (
    id SERIAL PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    risk_level VARCHAR NOT NULL,
    reasons JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_placement_risks_student_profile_id ON placement_risks(student_profile_id);

-- 7. ROLE_GAP_ANALYSES table
CREATE TABLE IF NOT EXISTS role_gap_analyses (
    id SERIAL PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    role_gaps JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_gap_analyses_student_profile_id ON role_gap_analyses(student_profile_id);

-- 8. COMPANY_FITS table
CREATE TABLE IF NOT EXISTS company_fits (
    id SERIAL PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    matches JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_fits_student_profile_id ON company_fits(student_profile_id);

-- 9. RESUME_ANALYSES table
CREATE TABLE IF NOT EXISTS resume_analyses (
    id SERIAL PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    file_name VARCHAR NOT NULL,
    extracted_skills JSONB NOT NULL,
    projects JSONB NOT NULL,
    experience JSONB NOT NULL,
    education JSONB NOT NULL,
    resume_score INTEGER NOT NULL,
    missing_keywords JSONB NOT NULL,
    weak_sections JSONB NOT NULL,
    suggestions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_analyses_student_profile_id ON resume_analyses(student_profile_id);
```



## Auth & Roles

- **Login** returns JWT.
- Admin role is derived from `ADMIN_EMAILS` in `.env`.
- `/admin/*` routes require admin JWT (`role=admin`).

---

## Main Endpoints

### Auth
- `POST /api/v1/auth/register` (supports `student_type`: `twelfth_student` | `college_student`; defaults to `college_student`)
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (returns `email`, `role`, `student_type`)

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
