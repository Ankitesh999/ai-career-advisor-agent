from __future__ import annotations

import logging
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company_fit import CompanyFit
from app.models.student_profile import StudentProfile
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)

COMPANY_PROFILES = [
    {"company": "Amazon", "domains": {"backend", "cloud", "data", "ai"}, "tier": "product"},
    {"company": "Google", "domains": {"backend", "ai", "ml"}, "tier": "product"},
    {"company": "Microsoft", "domains": {"backend", "cloud", "data"}, "tier": "product"},
    {"company": "TCS", "domains": {"backend", "data"}, "tier": "service"},
    {"company": "Infosys", "domains": {"backend", "data"}, "tier": "service"},
    {"company": "Wipro", "domains": {"backend", "data"}, "tier": "service"},
    {"company": "Accenture", "domains": {"data", "analytics", "cloud"}, "tier": "service"},
    {"company": "Deloitte", "domains": {"analytics", "data"}, "tier": "service"},
    {"company": "IBM", "domains": {"ai", "data", "cloud"}, "tier": "hybrid"},
]

DOMAIN_SKILLS = {
    "ai": {"python", "pytorch", "tensorflow", "mlops", "nlp"},
    "ml": {"python", "scikit-learn", "feature engineering", "mlops"},
    "data": {"python", "sql", "pandas", "statistics", "power bi", "tableau"},
    "backend": {"python", "java", "node", "sql", "api", "fastapi"},
    "cloud": {"aws", "azure", "gcp", "docker", "kubernetes"},
    "analytics": {"sql", "power bi", "tableau", "excel", "statistics"},
}


class CompanyFitService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.llm = LLMClient()

    def get_latest_by_profile(self, profile_id: int) -> CompanyFit | None:
        stmt = (
            select(CompanyFit)
            .where(CompanyFit.student_profile_id == profile_id)
            .order_by(CompanyFit.created_at.desc())
        )
        return self.db.scalar(stmt)

    def generate(self, profile: StudentProfile) -> CompanyFit:
        base = self._base_scores(profile)
        matches = self._apply_llm_adjustments(profile, base)

        fit = CompanyFit(student_profile_id=profile.id, matches=matches)
        self.db.add(fit)
        self.db.commit()
        self.db.refresh(fit)
        return fit

    def _base_scores(self, profile: StudentProfile) -> list[dict]:
        skills = {skill.lower() for skill in profile.current_skills}
        domain = self._infer_domains(profile)
        results = []

        for company in COMPANY_PROFILES:
            score = 50
            score += self._cgpa_points(profile.cgpa, company["tier"])
            score += self._count_points(profile.projects, 2, 8)
            score += self._count_points(profile.internships, 4, 12)
            score += self._count_points(profile.certifications, 2, 6)
            score += self._domain_fit_points(domain, skills, company["domains"])
            score = max(0, min(score, 100))
            results.append(
                {
                    "company": company["company"],
                    "score": score,
                    "rationale": self._rationale(company["domains"], skills),
                }
            )

        results.sort(key=lambda item: item["score"], reverse=True)
        return results[:6]

    def _apply_llm_adjustments(
        self, profile: StudentProfile, base: list[dict]
    ) -> list[dict]:
        if self.llm.client is None:
            return base

        system_prompt = (
            "You are a placement advisor. Adjust company fit scores by -10 to +10 "
            "based on student skill fit, CGPA, internships, and domain alignment. "
            "Return JSON like {\"Amazon\": 5, \"TCS\": -3}."
        )
        user_prompt = (
            "Student profile:\n"
            f"Degree: {profile.degree}\n"
            f"Specialization: {profile.specialization}\n"
            f"CGPA: {profile.cgpa}\n"
            f"Skills: {', '.join(profile.current_skills)}\n"
            f"Projects: {profile.projects}\n"
            f"Internships: {profile.internships}\n"
            f"Target Industry: {profile.target_industry}\n"
            "\nBase scores:\n"
            + "\n".join(f"{item['company']}: {item['score']}" for item in base)
        )

        try:
            adjustments = self.llm.generate_company_fit_adjustments(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.4,
                max_output_tokens=200,
            )
        except Exception as exc:
            logger.warning("LLM company fit adjustments failed: %s", exc)
            return base

        updated = []
        for item in base:
            delta = int(adjustments.get(item["company"], 0) or 0)
            item["score"] = max(0, min(item["score"] + delta, 100))
            updated.append(item)
        updated.sort(key=lambda item: item["score"], reverse=True)
        return updated

    def _infer_domains(self, profile: StudentProfile) -> set[str]:
        text = f"{profile.target_industry} {profile.specialization}".lower()
        domains = {key for key in DOMAIN_SKILLS if key in text}
        return domains or {"data"}

    def _domain_fit_points(
        self, profile_domains: set[str], skills: set[str], company_domains: Iterable[str]
    ) -> int:
        points = 0
        for domain in company_domains:
            if domain in profile_domains:
                points += 6
                points += self._skill_overlap_points(skills, DOMAIN_SKILLS.get(domain, set()))
        return min(points, 20)

    def _skill_overlap_points(self, skills: set[str], domain_skills: set[str]) -> int:
        overlap = len(skills & domain_skills)
        return min(overlap * 2, 10)

    def _cgpa_points(self, cgpa: float, tier: str) -> int:
        if cgpa >= 8.5:
            return 10 if tier == "product" else 8
        if cgpa >= 8.0:
            return 8 if tier == "product" else 7
        if cgpa >= 7.0:
            return 5 if tier == "product" else 6
        if cgpa >= 6.0:
            return 2
        return -2 if tier == "product" else 0

    def _count_points(self, count: int, weight: int, cap: int) -> int:
        return min(count * weight, cap)

    def _rationale(self, domains: Iterable[str], skills: set[str]) -> str:
        matched = []
        for domain in domains:
            if skills & DOMAIN_SKILLS.get(domain, set()):
                matched.append(domain)
        if matched:
            return f"Strength in {', '.join(sorted(matched))}."
        return "General fit based on profile."
