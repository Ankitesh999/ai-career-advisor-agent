from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CareerAnalysisCreate(BaseModel):
    career_recommendations: list[dict]
    skill_gaps: list[dict]
    learning_roadmap: list[dict]
    salary_insights: dict
    industry_trends: list[dict]


class CareerAnalysisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_profile_id: int
    career_recommendations: list[dict]
    skill_gaps: list[dict]
    learning_roadmap: list[dict]
    salary_insights: dict
    industry_trends: list[dict]
    created_at: datetime
