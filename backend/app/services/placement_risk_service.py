from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.placement_risk import PlacementRisk
from app.models.student_profile import StudentProfile


class PlacementRiskService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_latest_by_profile(self, profile_id: int) -> PlacementRisk | None:
        stmt = (
            select(PlacementRisk)
            .where(PlacementRisk.student_profile_id == profile_id)
            .order_by(PlacementRisk.created_at.desc())
        )
        return self.db.scalar(stmt)

    def generate(self, profile: StudentProfile) -> PlacementRisk:
        risk_level, reasons = self._compute_risk(profile)
        record = PlacementRisk(
            student_profile_id=profile.id,
            risk_level=risk_level,
            reasons=reasons,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def _compute_risk(self, profile: StudentProfile) -> tuple[str, list[str]]:
        reasons: list[str] = []
        risk_points = 0

        if profile.cgpa < 6.5:
            risk_points += 3
            reasons.append("Low CGPA may reduce shortlisting chances.")
        elif profile.cgpa < 7.0:
            risk_points += 2
            reasons.append("CGPA below 7 can limit Tier-1 opportunities.")

        if len(profile.current_skills) < 4:
            risk_points += 2
            reasons.append("Limited technical skill coverage.")

        if profile.projects < 2:
            risk_points += 2
            reasons.append("Insufficient number of projects.")

        if profile.internships < 1:
            risk_points += 2
            reasons.append("No internship experience yet.")

        if profile.certifications < 1:
            risk_points += 1
            reasons.append("No certifications to validate skills.")

        if profile.twelfth_percentage < 70:
            risk_points += 1
            reasons.append("Lower academic consistency (12th percentage).")

        if risk_points >= 7:
            level = "High"
        elif risk_points >= 4:
            level = "Medium"
        else:
            level = "Low"

        if not reasons:
            reasons.append("Strong profile signals across academics and projects.")

        return level, reasons[:6]
