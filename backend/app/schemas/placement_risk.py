from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class PlacementRiskRead(BaseModel):
    id: int
    student_profile_id: int
    risk_level: str
    reasons: list[str]
    created_at: datetime

    class Config:
        from_attributes = True
