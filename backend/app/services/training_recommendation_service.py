from __future__ import annotations

from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.career_analysis import CareerAnalysis
from app.models.student_profile import StudentProfile
from app.schemas.training_recommendations import (
    TrainingProgram,
    TrainingRecommendationsRead,
    WeakSkill,
)

PROGRAM_MAP: dict[str, TrainingProgram] = {
    "Machine Learning": TrainingProgram(
        title="Machine Learning Foundations",
        focus_skills=["Machine Learning", "Feature Engineering", "Model Evaluation"],
        description="Covers core ML algorithms, metrics, and practical modeling workflows.",
    ),
    "Deep Learning": TrainingProgram(
        title="Deep Learning Practitioner",
        focus_skills=["Deep Learning", "Neural Networks", "PyTorch/TensorFlow"],
        description="Hands-on neural nets, CNNs, RNNs/Transformers with real datasets.",
    ),
    "SQL": TrainingProgram(
        title="SQL for Analytics",
        focus_skills=["SQL", "Joins", "Window Functions"],
        description="Querying, analytics workflows, and data extraction for ML projects.",
    ),
    "Statistics": TrainingProgram(
        title="Statistics for Data Science",
        focus_skills=["Statistics", "Probability", "Experimentation"],
        description="Confidence intervals, hypothesis testing, and experiment design.",
    ),
    "MLOps": TrainingProgram(
        title="MLOps Bootcamp",
        focus_skills=["MLOps", "Deployment", "Monitoring"],
        description="Model serving, pipelines, monitoring, and production workflows.",
    ),
}


class TrainingRecommendationService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_recommendations(self, limit: int = 8) -> TrainingRecommendationsRead:
        profiles = self._latest_profiles_per_user()
        total_students = len(profiles)

        skill_counter: Counter[str] = Counter()
        for profile in profiles:
            analysis = self._latest_analysis(profile.id)
            if analysis is None:
                continue
            for item in analysis.skill_gaps or []:
                skill = item.get("skill")
                if skill:
                    skill_counter[skill] += 1

        weak_skills = [
            WeakSkill(skill=skill, count=count)
            for skill, count in skill_counter.most_common(limit)
        ]

        programs = self._programs_from_skills([item.skill for item in weak_skills])

        return TrainingRecommendationsRead(
            total_students=total_students, weak_skills=weak_skills, programs=programs
        )

    def _latest_profiles_per_user(self) -> list[StudentProfile]:
        profiles = self.db.scalars(
            select(StudentProfile).order_by(
                StudentProfile.user_id, StudentProfile.created_at.desc()
            )
        ).all()
        latest: dict[int, StudentProfile] = {}
        for profile in profiles:
            if profile.user_id not in latest:
                latest[profile.user_id] = profile
        return list(latest.values())

    def _latest_analysis(self, profile_id: int) -> CareerAnalysis | None:
        return self.db.scalar(
            select(CareerAnalysis)
            .where(CareerAnalysis.student_profile_id == profile_id)
            .order_by(CareerAnalysis.created_at.desc())
        )

    def _programs_from_skills(self, skills: list[str]) -> list[TrainingProgram]:
        programs: list[TrainingProgram] = []
        for skill in skills:
            program = PROGRAM_MAP.get(skill)
            if program and program not in programs:
                programs.append(program)
        return programs[:4]
