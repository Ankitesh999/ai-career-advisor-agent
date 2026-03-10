from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class RoleGapItem(BaseModel):
    role: str
    missing_skills: list[str]
    learning_plan: list[str]


class RoleGapAnalysisRead(BaseModel):
    id: int
    student_profile_id: int
    role_gaps: list[RoleGapItem]
    created_at: datetime

    class Config:
        from_attributes = True
