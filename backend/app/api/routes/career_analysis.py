from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.career_analysis import CareerAnalysisRead
from app.services.career_analysis_service import CareerAnalysisService

router = APIRouter(prefix="/analysis", tags=["career-analysis"])


@router.post("/{profile_id}", response_model=CareerAnalysisRead, status_code=status.HTTP_201_CREATED)
def create_analysis(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CareerAnalysisRead:
    service = CareerAnalysisService(db)
    try:
        analysis = service.generate_analysis(profile_id, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return CareerAnalysisRead.model_validate(analysis)


@router.get("/{profile_id}", response_model=CareerAnalysisRead)
def get_analysis(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CareerAnalysisRead:
    service = CareerAnalysisService(db)
    analysis = service.get_analysis_by_profile_id(profile_id, current_user.id)
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return CareerAnalysisRead.model_validate(analysis)
