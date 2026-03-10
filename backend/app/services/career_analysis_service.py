from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.models.career_analysis import CareerAnalysis
from app.schemas.career_analysis import CareerAnalysisCreate
from app.services.ai_engine import CareerAIEngine


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

    def get_analysis_by_profile_id(
        self, profile_id: int, user_id: int
    ) -> CareerAnalysis | None:
        stmt = (
            select(CareerAnalysis)
            .where(CareerAnalysis.student_profile_id == profile_id)
            .order_by(CareerAnalysis.created_at.desc())
        )
        analysis = self.db.scalar(stmt)
        if analysis is None:
            return None
        profile = self.db.get(StudentProfile, profile_id)
        if profile is None or profile.user_id != user_id:
            return None
        return analysis

    def generate_analysis(self, profile_id: int, user_id: int) -> CareerAnalysis:
        profile = self.db.get(StudentProfile, profile_id)
        if profile is None or profile.user_id != user_id:
            raise ValueError("Profile not found")

        engine = CareerAIEngine()
        payload = CareerAnalysisCreate(
            career_recommendations=engine.generate_career_recommendations(profile),
            skill_gaps=engine.generate_skill_gaps(profile),
            learning_roadmap=engine.generate_learning_roadmap(profile),
            salary_insights=engine.generate_salary_insights(profile),
            industry_trends=engine.generate_industry_trends(profile),
        )
        return self.create_analysis(profile_id, payload)
