from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ResumeAnalysisRead(BaseModel):
    id: int
    student_profile_id: int
    file_name: str
    extracted_skills: list[str]
    projects: list[str]
    experience: list[str]
    education: list[str]
    resume_score: int
    missing_keywords: list[str]
    weak_sections: list[str]
    suggestions: list[str]
    created_at: datetime

    class Config:
        from_attributes = True
