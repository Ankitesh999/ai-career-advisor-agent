from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class CompanyFitMatch(BaseModel):
    company: str
    score: int
    rationale: str | None = None


class CompanyFitRead(BaseModel):
    id: int
    student_profile_id: int
    matches: list[CompanyFitMatch]
    created_at: datetime

    class Config:
        from_attributes = True
