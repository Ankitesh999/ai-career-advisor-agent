from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentProfileCreate(BaseModel):
    name: str
    twelfth_percentage: float
    degree: str
    specialization: str
    current_skills: list[str]
    interests: list[str]
    target_industry: str


class StudentProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    twelfth_percentage: float
    degree: str
    specialization: str
    current_skills: list[str]
    interests: list[str]
    target_industry: str
    created_at: datetime
