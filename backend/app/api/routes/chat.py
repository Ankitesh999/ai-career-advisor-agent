from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
import json
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.services.career_analysis_service import CareerAnalysisService
from app.services.llm_client import LLMClient

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("/{profile_id}", response_model=ChatResponse)
def chat_with_advisor(
    profile_id: int,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    profile = db.get(StudentProfile, profile_id)
    if profile is None or profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    analysis_service = CareerAnalysisService(db)
    analysis = analysis_service.get_analysis_by_profile_id(profile_id, current_user.id)
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    system_prompt = (
        "You are an expert career advisor and industry analyst.\n\n"
        "Your job is to guide students toward realistic career paths\n"
        "based on their skills, education, interests, and industry demand.\n\n"
        "When answering:\n"
        "• Refer to the student's existing skills\n"
        "• Identify missing skills clearly\n"
        "• Give practical next steps\n"
        "• Suggest learning resources when useful\n"
        "• Keep answers concise and structured\n"
    )
    user_prompt = (
        "Student Profile:\n"
        f"Name: {profile.name}\n"
        f"Degree: {profile.degree}\n"
        f"Specialization: {profile.specialization}\n"
        f"Current Skills: {', '.join(profile.current_skills)}\n"
        f"Interests: {', '.join(profile.interests)}\n"
        f"Target Industry: {profile.target_industry}\n\n"
        "Career Recommendations:\n"
        f"{json.dumps(analysis.career_recommendations, indent=2)}\n\n"
        "Skill Gaps:\n"
        f"{json.dumps(analysis.skill_gaps, indent=2)}\n\n"
        "Learning Roadmap:\n"
        f"{json.dumps(analysis.learning_roadmap, indent=2)}\n\n"
        "User Question:\n"
        f"{payload.message}\n"
    )

    llm = LLMClient()
    try:
        answer = llm.generate_chat_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.6,
            max_output_tokens=400,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="LLM request failed"
        ) from exc

    return ChatResponse(response=answer)
