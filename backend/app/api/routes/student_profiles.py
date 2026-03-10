from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.student_profile import StudentProfileCreate, StudentProfileRead
from app.services.student_profile_service import StudentProfileService

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("", response_model=StudentProfileRead, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: StudentProfileCreate, db: Session = Depends(get_db)
) -> StudentProfileRead:
    service = StudentProfileService(db)
    profile = service.create_profile(payload)
    return StudentProfileRead.model_validate(profile)


@router.get("/{profile_id}", response_model=StudentProfileRead)
def get_profile(profile_id: int, db: Session = Depends(get_db)) -> StudentProfileRead:
    service = StudentProfileService(db)
    profile = service.get_profile_by_id(profile_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return StudentProfileRead.model_validate(profile)


@router.get("", response_model=list[StudentProfileRead])
def list_profiles(db: Session = Depends(get_db)) -> list[StudentProfileRead]:
    service = StudentProfileService(db)
    profiles = service.list_profiles()
    return [StudentProfileRead.model_validate(profile) for profile in profiles]
