from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.employability_score import EmployabilityScore
from app.models.student_profile import StudentProfile
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)


def _clamp(value: int, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, value))


class EmployabilityService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _base_scores(self, profile: StudentProfile) -> dict:
        academic_strength = _clamp(int(0.5 * profile.twelfth_percentage + 5 * profile.cgpa))

        skills_count = len(profile.current_skills)
        technical_skills = _clamp(skills_count * 8 + profile.certifications * 10)

        industry_readiness = _clamp(profile.projects * 12 + profile.internships * 20)

        resume_quality = _clamp(
            profile.projects * 8 + profile.internships * 15 + profile.certifications * 8
        )

        return {
            "academic_strength": academic_strength,
            "technical_skills": technical_skills,
            "industry_readiness": industry_readiness,
            "resume_quality": resume_quality,
        }

    def _overall_score(self, scores: dict) -> int:
        overall = (
            scores["academic_strength"] * 0.3
            + scores["technical_skills"] * 0.3
            + scores["industry_readiness"] * 0.25
            + scores["resume_quality"] * 0.15
        )
        return _clamp(int(round(overall)))

    def _apply_llm_adjustments(self, profile: StudentProfile, scores: dict) -> dict:
        llm = LLMClient()
        system_prompt = (
            "You are a placement evaluator. Given a student profile and base scores, "
            "suggest small adjustments to each score in range -10 to +10. "
            "Return JSON with keys: academic_delta, technical_delta, industry_delta, resume_delta."
        )
        user_prompt = (
            "Student profile:\n"
            f"12th Percentage: {profile.twelfth_percentage}\n"
            f"CGPA: {profile.cgpa}\n"
            f"Skills: {', '.join(profile.current_skills)}\n"
            f"Projects: {profile.projects}\n"
            f"Internships: {profile.internships}\n"
            f"Certifications: {profile.certifications}\n"
            f"Specialization: {profile.specialization}\n\n"
            "Base scores:\n"
            f"Academic: {scores['academic_strength']}\n"
            f"Technical: {scores['technical_skills']}\n"
            f"Industry: {scores['industry_readiness']}\n"
            f"Resume: {scores['resume_quality']}\n"
        )

        try:
            deltas = llm.generate_employability_adjustments(system_prompt, user_prompt)
        except Exception as exc:
            logger.warning("LLM adjustments failed, using base scores: %s", exc)
            return scores

        academic = _clamp(scores["academic_strength"] + int(deltas.get("academic_delta", 0)))
        technical = _clamp(scores["technical_skills"] + int(deltas.get("technical_delta", 0)))
        industry = _clamp(scores["industry_readiness"] + int(deltas.get("industry_delta", 0)))
        resume = _clamp(scores["resume_quality"] + int(deltas.get("resume_delta", 0)))

        return {
            "academic_strength": academic,
            "technical_skills": technical,
            "industry_readiness": industry,
            "resume_quality": resume,
        }

    def compute_score(
        self, profile_id: int, user_id: int, allow_admin: bool = False
    ) -> EmployabilityScore:
        profile = self.db.get(StudentProfile, profile_id)
        if profile is None or (profile.user_id != user_id and not allow_admin):
            raise ValueError("Profile not found")

        scores = self._base_scores(profile)
        scores = self._apply_llm_adjustments(profile, scores)
        overall = self._overall_score(scores)

        record = EmployabilityScore(
            student_profile_id=profile_id,
            overall_score=overall,
            academic_strength=scores["academic_strength"],
            technical_skills=scores["technical_skills"],
            industry_readiness=scores["industry_readiness"],
            resume_quality=scores["resume_quality"],
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_latest_score(
        self, profile_id: int, user_id: int, allow_admin: bool = False
    ) -> EmployabilityScore | None:
        profile = self.db.get(StudentProfile, profile_id)
        if profile is None or (profile.user_id != user_id and not allow_admin):
            return None
        stmt = (
            select(EmployabilityScore)
            .where(EmployabilityScore.student_profile_id == profile_id)
            .order_by(EmployabilityScore.created_at.desc())
        )
        return self.db.scalar(stmt)
