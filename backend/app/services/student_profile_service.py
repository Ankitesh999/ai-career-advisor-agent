from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.schemas.student_profile import StudentProfileCreate


class StudentProfileService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_profile(
        self, payload: StudentProfileCreate, user_id: int
    ) -> StudentProfile:
        profile = StudentProfile(
            user_id=user_id,
            name=payload.name,
            twelfth_percentage=payload.twelfth_percentage,
            cgpa=payload.cgpa,
            degree=payload.degree,
            specialization=payload.specialization,
            current_skills=payload.current_skills,
            interests=payload.interests,
            target_industry=payload.target_industry,
            projects=payload.projects,
            internships=payload.internships,
            certifications=payload.certifications,
            subjects=payload.subjects,
            math_strength=payload.math_strength,
            logical_reasoning=payload.logical_reasoning,
            programming_interest=payload.programming_interest,
            user_type=payload.user_type or "college_student",
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def get_profile_by_id(self, profile_id: int, user_id: int) -> StudentProfile | None:
        stmt = select(StudentProfile).where(
            StudentProfile.id == profile_id, StudentProfile.user_id == user_id
        )
        return self.db.scalar(stmt)

    def list_profiles(self, user_id: int) -> list[StudentProfile]:
        stmt = (
            select(StudentProfile)
            .where(StudentProfile.user_id == user_id)
            .order_by(StudentProfile.id)
        )
        return list(self.db.scalars(stmt))

    def update_profile(
        self, profile_id: int, user_id: int, payload: StudentProfileCreate
    ) -> StudentProfile | None:
        profile = self.db.get(StudentProfile, profile_id)
        if profile is None or profile.user_id != user_id:
            return None

        profile.name = payload.name
        profile.twelfth_percentage = payload.twelfth_percentage
        profile.cgpa = payload.cgpa
        profile.degree = payload.degree
        profile.specialization = payload.specialization
        profile.current_skills = payload.current_skills
        profile.interests = payload.interests
        profile.target_industry = payload.target_industry
        profile.projects = payload.projects
        profile.internships = payload.internships
        profile.certifications = payload.certifications
        profile.subjects = payload.subjects
        profile.math_strength = payload.math_strength
        profile.logical_reasoning = payload.logical_reasoning
        profile.programming_interest = payload.programming_interest
        if payload.user_type:
            profile.user_type = payload.user_type

        self.db.commit()
        self.db.refresh(profile)
        return profile
