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

    def create_analysis(
        self, profile_id: int, payload: CareerAnalysisCreate
    ) -> CareerAnalysis:
        analysis = CareerAnalysis(
            student_profile_id=profile_id,
            career_recommendations=payload.career_recommendations,
            skill_gaps=payload.skill_gaps,
            learning_roadmap=payload.learning_roadmap,
            salary_insights=payload.salary_insights,
            industry_trends=payload.industry_trends,
            aiml_score=payload.aiml_score,
            cyber_security_score=payload.cyber_security_score,
            recommended_branch=payload.recommended_branch,
            branch_reasoning=payload.branch_reasoning,
            aiml_roles=payload.aiml_roles,
            cyber_roles=payload.cyber_roles,
            aiml_skills=payload.aiml_skills,
            cyber_skills=payload.cyber_skills,
            aiml_roadmap=payload.aiml_roadmap,
            cyber_roadmap=payload.cyber_roadmap,
            industry_insights=payload.industry_insights,
        )
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def get_analysis_by_profile_id(
        self, profile_id: int, user_id: int, allow_admin: bool = False
    ) -> CareerAnalysis | None:
        stmt = (
            select(CareerAnalysis)
            .where(CareerAnalysis.student_profile_id == profile_id)
            .order_by(CareerAnalysis.created_at.desc())
        )
        analysis = self.db.scalar(stmt)
        if analysis is None:
            return None
        if not allow_admin:
            profile = self.db.get(StudentProfile, profile_id)
            if profile is None or profile.user_id != user_id:
                return None
        return analysis

    def generate_analysis(
        self, profile_id: int, user_id: int, allow_admin: bool = False
    ) -> CareerAnalysis:
        profile = self.db.get(StudentProfile, profile_id)
        if profile is None or (profile.user_id != user_id and not allow_admin):
            raise ValueError("Profile not found")

        user_type = profile.user_type or "college_student"
        is_twelfth_student = user_type == "twelfth_student"

        engine = CareerAIEngine()

        if is_twelfth_student:
            branch_analysis = engine.generate_branch_analysis(profile)
            aiml_score = branch_analysis.get("aiml_score")
            cyber_security_score = branch_analysis.get("cyber_security_score")
            recommended_branch = branch_analysis.get("recommended_branch")
            branch_reasoning = branch_analysis.get("branch_reasoning")
            aiml_roles = branch_analysis.get("aiml_roles")
            cyber_roles = branch_analysis.get("cyber_roles")
            aiml_skills = branch_analysis.get("aiml_skills")
            cyber_skills = branch_analysis.get("cyber_skills")
            aiml_roadmap = branch_analysis.get("aiml_roadmap")
            cyber_roadmap = branch_analysis.get("cyber_roadmap")
            industry_insights = branch_analysis.get("industry_insights")
        else:
            aiml_score = None
            cyber_security_score = None
            recommended_branch = None
            branch_reasoning = None
            aiml_roles = None
            cyber_roles = None
            aiml_skills = None
            cyber_skills = None
            aiml_roadmap = None
            cyber_roadmap = None
            industry_insights = None

        payload = CareerAnalysisCreate(
            career_recommendations=engine.generate_career_recommendations(profile),
            skill_gaps=engine.generate_skill_gaps(profile),
            learning_roadmap=engine.generate_learning_roadmap(profile),
            salary_insights=engine.generate_salary_insights(profile),
            industry_trends=engine.generate_industry_trends(profile),
            aiml_score=aiml_score,
            cyber_security_score=cyber_security_score,
            recommended_branch=recommended_branch,
            branch_reasoning=branch_reasoning,
            aiml_roles=aiml_roles,
            cyber_roles=cyber_roles,
            aiml_skills=aiml_skills,
            cyber_skills=cyber_skills,
            aiml_roadmap=aiml_roadmap,
            cyber_roadmap=cyber_roadmap,
            industry_insights=industry_insights,
        )
        return self.create_analysis(profile_id, payload)
