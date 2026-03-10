from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.employability_score import EmployabilityScore
from app.models.placement_risk import PlacementRisk
from app.models.student_profile import StudentProfile
from app.schemas.admin_dashboard import AdminMetricsRead, AdminStudentRead


class AdminDashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_metrics(self) -> AdminMetricsRead:
        profiles = list(self.db.scalars(select(StudentProfile)))
        total_profiles = len(profiles)
        total_students = len({profile.user_id for profile in profiles})

        latest_scores = self._latest_employability_scores()
        latest_risks = self._latest_placement_risks()

        placement_ready = 0
        needs_training = 0
        high_risk = 0

        for profile in profiles:
            score = latest_scores.get(profile.id)
            risk = latest_risks.get(profile.id)

            score_value = score.overall_score if score else None
            risk_level = risk.risk_level if risk else None

            if risk_level == "High" or (score_value is not None and score_value < 50):
                high_risk += 1
            elif risk_level == "Low" and (score_value is not None and score_value >= 70):
                placement_ready += 1
            else:
                needs_training += 1

        return AdminMetricsRead(
            total_profiles=total_profiles,
            total_students=total_students,
            placement_ready=placement_ready,
            needs_training=needs_training,
            high_risk=high_risk,
        )

    def list_students(self) -> list[AdminStudentRead]:
        profiles = list(
            self.db.scalars(select(StudentProfile).order_by(StudentProfile.created_at.desc()))
        )
        latest_scores = self._latest_employability_scores()
        latest_risks = self._latest_placement_risks()

        results: list[AdminStudentRead] = []
        for profile in profiles:
            score = latest_scores.get(profile.id)
            risk = latest_risks.get(profile.id)
            results.append(
                AdminStudentRead(
                    profile_id=profile.id,
                    user_id=profile.user_id,
                    name=profile.name,
                    degree=profile.degree,
                    specialization=profile.specialization,
                    cgpa=profile.cgpa,
                    created_at=profile.created_at,
                    employability_score=score.overall_score if score else None,
                    placement_risk=risk.risk_level if risk else None,
                )
            )
        return results

    def _latest_employability_scores(self) -> dict[int, EmployabilityScore]:
        scores = self.db.scalars(
            select(EmployabilityScore).order_by(
                EmployabilityScore.student_profile_id, EmployabilityScore.created_at.desc()
            )
        ).all()
        latest: dict[int, EmployabilityScore] = {}
        for score in scores:
            if score.student_profile_id not in latest:
                latest[score.student_profile_id] = score
        return latest

    def _latest_placement_risks(self) -> dict[int, PlacementRisk]:
        risks = self.db.scalars(
            select(PlacementRisk).order_by(
                PlacementRisk.student_profile_id, PlacementRisk.created_at.desc()
            )
        ).all()
        latest: dict[int, PlacementRisk] = {}
        for risk in risks:
            if risk.student_profile_id not in latest:
                latest[risk.student_profile_id] = risk
        return latest
