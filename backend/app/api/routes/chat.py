from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_context, get_db
from app.models.student_profile import StudentProfile
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
    context=Depends(get_current_user_context),
) -> ChatResponse:
    current_user, role = context
    profile = db.get(StudentProfile, profile_id)
    if profile is None or (profile.user_id != current_user.id and role != "admin"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    analysis_service = CareerAnalysisService(db)
    analysis = analysis_service.get_analysis_by_profile_id(
        profile_id, current_user.id, allow_admin=role == "admin"
    )
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")

    system_prompt = (
        "You are an expert career advisor and industry analyst.\n\n"
        "Your job is to guide students toward realistic career paths\n"
        "based on their skills, education, interests, and industry demand.\n\n"
        "When answering:\n"
        "- Refer to the student's existing skills\n"
        "- Identify missing skills clearly\n"
        "- Give practical next steps\n"
        "- Suggest learning resources when useful\n"
        "- Keep answers concise and structured\n"
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
            max_output_tokens=900,
        )
    except Exception:
        answer = _fallback_chat_response(profile, analysis, payload.message)

    return ChatResponse(response=answer)


def _fallback_chat_response(profile: StudentProfile, analysis: object, message: str) -> str:
    recommendations = getattr(analysis, "career_recommendations", []) or []
    skill_gaps = getattr(analysis, "skill_gaps", []) or []
    roadmap = getattr(analysis, "learning_roadmap", []) or []

    msg = message.lower().strip()
    top_roles = ", ".join([item.get("role", "") for item in recommendations[:3] if item])
    gaps = ", ".join([item.get("skill", "") for item in skill_gaps[:3] if item])
    stage = roadmap[0].get("stage") if roadmap else "Foundations"
    topics = ", ".join(roadmap[0].get("topics", [])) if roadmap else ""

    if "roadmap" in msg or "plan" in msg:
        return (
            f"Here is a concise ML roadmap tailored to your profile ({profile.degree} in {profile.specialization}):\n"
            "1) Foundations (2â€“4 weeks): Python, Linear Algebra, Probability, Statistics.\n"
            "2) Core ML (4â€“6 weeks): Supervised/Unsupervised learning, model evaluation, feature engineering.\n"
            "3) Deep Learning (4â€“6 weeks): Neural nets, CNNs, RNNs/Transformers, PyTorch/TensorFlow.\n"
            "4) Applied Projects (ongoing): 2â€“3 ML projects with real datasets + deployment.\n"
            "5) MLOps basics (2â€“3 weeks): model serving, experiment tracking, pipelines.\n"
            f"Key gaps to focus: {gaps or 'ML fundamentals, SQL, project depth'}.\n"
            "Ask for a role-specific roadmap if you want tighter guidance."
        )

    if "data scientist" in msg or "data science" in msg:
        return (
            "For Data Scientist, prioritize:\n"
            "1) Statistics + SQL depth (hypothesis testing, regression, joins, window functions).\n"
            "2) Python for data (pandas, numpy, scikit-learn) + storytelling.\n"
            "3) Projects: EDA + modeling + dashboards.\n"
            f"Key gaps from your profile: {gaps or 'SQL, applied statistics'}."
        )

    if "machine learning" in msg or "ml engineer" in msg:
        return (
            "For ML Engineer, prioritize:\n"
            "1) ML systems + deployment (FastAPI, model serving, APIs).\n"
            "2) Deep learning frameworks (PyTorch/TensorFlow) + experiment tracking.\n"
            "3) Projects: end-to-end pipelines with deployment.\n"
            f"Start with {stage}: {topics or 'Python + Linear Algebra + Probability'}."
        )

    response = (
        f"Based on your profile ({profile.degree} in {profile.specialization}), "
        "here's a quick direction:\n"
    )
    if top_roles:
        response += f"\nTop roles: {top_roles}."
    if gaps:
        response += f"\nKey gaps to focus: {gaps}."
    if topics:
        response += f"\nStart with {stage}: {topics}."
    response += "\n\nAsk about a specific role or skill and I can refine the steps."
    return response
