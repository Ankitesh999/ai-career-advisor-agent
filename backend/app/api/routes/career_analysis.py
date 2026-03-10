from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_context, get_db
from app.schemas.career_analysis import CareerAnalysisRead
from app.services.career_analysis_service import CareerAnalysisService

router = APIRouter(prefix="/analysis", tags=["career-analysis"])


@router.post("/{profile_id}", response_model=CareerAnalysisRead, status_code=status.HTTP_201_CREATED)
def create_analysis(
    profile_id: int,
    db: Session = Depends(get_db),
    context=Depends(get_current_user_context),
) -> CareerAnalysisRead:
    current_user, role = context
    service = CareerAnalysisService(db)
    try:
        analysis = service.generate_analysis(profile_id, current_user.id, allow_admin=role == "admin")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return CareerAnalysisRead.model_validate(analysis)


@router.get("/{profile_id}", response_model=CareerAnalysisRead)
def get_analysis(
    profile_id: int,
    db: Session = Depends(get_db),
    context=Depends(get_current_user_context),
) -> CareerAnalysisRead:
    current_user, role = context
    service = CareerAnalysisService(db)
    analysis = service.get_analysis_by_profile_id(
        profile_id, current_user.id, allow_admin=role == "admin"
    )
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return CareerAnalysisRead.model_validate(analysis)
