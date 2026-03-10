from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class AdminMetricsRead(BaseModel):
    total_profiles: int
    total_students: int
    placement_ready: int
    needs_training: int
    high_risk: int


class AdminStudentRead(BaseModel):
    profile_id: int
    user_id: int
    name: str
    degree: str
    specialization: str
    cgpa: float
    created_at: datetime
    employability_score: int | None
    placement_risk: str | None
