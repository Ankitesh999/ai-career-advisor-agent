from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.role_gap_analysis import RoleGapAnalysis
from app.models.student_profile import StudentProfile

ROLE_REQUIREMENTS = {
    "AI Engineer": [
        "Python",
        "Machine Learning",
        "Deep Learning",
        "Model Deployment",
        "MLOps",
        "PyTorch/TensorFlow",
        "Data Pipelines",
        "Cloud Basics",
    ],
    "Data Scientist": [
        "Python",
        "SQL",
        "Statistics",
        "Experimentation",
        "Data Visualization",
        "Machine Learning",
        "Feature Engineering",
    ],
    "Backend Developer": [
        "APIs",
        "Databases",
        "System Design",
        "Testing",
        "Caching",
        "Python/Java/Node",
        "DevOps Basics",
    ],
    "Product Engineer": [
        "Frontend Basics",
        "Backend Basics",
        "APIs",
        "System Design",
        "UX Awareness",
        "Product Thinking",
        "Testing",
    ],
}


class RoleGapService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_latest_by_profile(self, profile_id: int) -> RoleGapAnalysis | None:
        stmt = (
            select(RoleGapAnalysis)
            .where(RoleGapAnalysis.student_profile_id == profile_id)
            .order_by(RoleGapAnalysis.created_at.desc())
        )
        return self.db.scalar(stmt)

    def generate(self, profile: StudentProfile) -> RoleGapAnalysis:
        skill_set = {skill.strip().lower() for skill in profile.current_skills}
        role_gaps = []
        for role, requirements in ROLE_REQUIREMENTS.items():
            missing = [
                req
                for req in requirements
                if req.lower().replace("/", " ").split()[0] not in skill_set
                and req.lower() not in skill_set
            ]
            plan = self._build_plan(role, missing, profile)
            role_gaps.append(
                {
                    "role": role,
                    "missing_skills": missing,
                    "learning_plan": plan,
                }
            )

        analysis = RoleGapAnalysis(student_profile_id=profile.id, role_gaps=role_gaps)
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def _build_plan(
        self, role: str, missing: list[str], profile: StudentProfile
    ) -> list[str]:
        plan = []
        if missing:
            plan.append(f"Prioritize: {', '.join(missing[:3])}.")
        if profile.projects < 2:
            plan.append("Build 2 role-aligned projects to demonstrate competence.")
        if profile.internships < 1:
            plan.append("Try a short internship or open-source contribution.")
        if role in {"AI Engineer", "Data Scientist"}:
            plan.append("Practice with datasets and document results clearly.")
        if role == "Backend Developer":
            plan.append("Ship a backend API with auth, database, and testing.")
        if role == "Product Engineer":
            plan.append("Build a full-stack feature with UX and performance focus.")
        return plan[:5]
