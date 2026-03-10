from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.schemas.student_profile import StudentProfileCreate


class StudentProfileService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_profile(self, payload: StudentProfileCreate) -> StudentProfile:
        profile = StudentProfile(
            name=payload.name,
            twelfth_percentage=payload.twelfth_percentage,
            degree=payload.degree,
            specialization=payload.specialization,
            current_skills=payload.current_skills,
            interests=payload.interests,
            target_industry=payload.target_industry,
        )
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def get_profile_by_id(self, profile_id: int) -> StudentProfile | None:
        stmt = select(StudentProfile).where(StudentProfile.id == profile_id)
        return self.db.scalar(stmt)

    def list_profiles(self) -> list[StudentProfile]:
        stmt = select(StudentProfile).order_by(StudentProfile.id)
        return list(self.db.scalars(stmt))
