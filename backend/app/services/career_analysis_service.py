from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.career_analysis import CareerAnalysis
from app.schemas.career_analysis import CareerAnalysisCreate


class CareerAnalysisService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_analysis(self, profile_id: int, payload: CareerAnalysisCreate) -> CareerAnalysis:
        analysis = CareerAnalysis(
            student_profile_id=profile_id,
            career_recommendations=payload.career_recommendations,
            skill_gaps=payload.skill_gaps,
            learning_roadmap=payload.learning_roadmap,
            salary_insights=payload.salary_insights,
            industry_trends=payload.industry_trends,
        )
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def get_analysis_by_profile_id(self, profile_id: int) -> CareerAnalysis | None:
        stmt = (
            select(CareerAnalysis)
            .where(CareerAnalysis.student_profile_id == profile_id)
            .order_by(CareerAnalysis.created_at.desc())
        )
        return self.db.scalar(stmt)
