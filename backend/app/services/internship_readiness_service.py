from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.internship_readiness import InternshipReadiness
from app.models.student_profile import StudentProfile


class InternshipReadinessService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_latest_by_profile(self, profile_id: int) -> InternshipReadiness | None:
        stmt = (
            select(InternshipReadiness)
            .where(InternshipReadiness.student_profile_id == profile_id)
            .order_by(InternshipReadiness.created_at.desc())
        )
        return self.db.scalar(stmt)

    def generate(self, profile: StudentProfile) -> InternshipReadiness:
        score, level, plan = self._compute(profile)
        record = InternshipReadiness(
            student_profile_id=profile.id,
            readiness_score=score,
            readiness_level=level,
            action_plan=plan,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def _compute(self, profile: StudentProfile) -> tuple[int, str, list[str]]:
        score = 40
        score += min(int(profile.cgpa * 6), 25)
        score += min(profile.projects * 6, 18)
        score += min(profile.internships * 12, 20)
        score += min(profile.certifications * 5, 10)
        score += min(len(profile.current_skills) * 2, 12)
        score = max(0, min(score, 100))

        if score >= 75:
            level = "High"
        elif score >= 55:
            level = "Medium"
        else:
            level = "Low"

        plan: list[str] = []
        if profile.projects < 2:
            plan.append("Build 2 role-aligned projects with measurable outcomes.")
        if profile.internships < 1:
            plan.append("Apply for 1-2 short internships or open-source contributions.")
        if profile.certifications < 1:
            plan.append("Earn one certification in a core domain (ML/DS/Backend).")
        if len(profile.current_skills) < 5:
            plan.append("Strengthen fundamentals: Python, SQL, statistics, and Git.")
        plan.append("Prepare a concise resume and portfolio for internship applications.")

        return score, level, plan[:5]
