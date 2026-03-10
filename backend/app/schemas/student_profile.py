from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudentProfileCreate(BaseModel):
    name: str
    twelfth_percentage: float
    cgpa: float = 0.0
    degree: str
    specialization: str
    current_skills: list[str]
    interests: list[str]
    target_industry: str
    projects: int = 0
    internships: int = 0
    certifications: int = 0


class StudentProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    twelfth_percentage: float
    cgpa: float
    degree: str
    specialization: str
    current_skills: list[str]
    interests: list[str]
    target_industry: str
    projects: int
    internships: int
    certifications: int
    created_at: datetime
