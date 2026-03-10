from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class InternshipReadinessRead(BaseModel):
    id: int
    student_profile_id: int
    readiness_score: int
    readiness_level: str
    action_plan: list[str]
    created_at: datetime

    class Config:
        from_attributes = True
