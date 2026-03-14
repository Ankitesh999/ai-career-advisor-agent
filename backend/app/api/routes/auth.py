from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import Literal

from app.api.deps import get_current_user, get_db
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


StudentType = Literal["twelfth_student", "college_student"]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    student_type: StudentType = "college_student"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    email: EmailStr
    role: str
    student_type: StudentType


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long (max 72 bytes).",
        )
    user = User(
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        student_type=payload.student_type,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists") from exc
    db.refresh(user)
    return {"id": user.id, "email": user.email, "student_type": user.student_type}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password too long (max 72 bytes).",
        )
    user = db.query(User).filter(User.email == str(payload.email)).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    settings = get_settings()
    role = "admin" if user.email.lower() in settings.admin_emails else "user"
    token = create_access_token(str(user.id), role=role)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)) -> MeResponse:
    settings = get_settings()
    role = "admin" if user.email.lower() in settings.admin_emails else "user"
    student_type: StudentType = "twelfth_student" if user.student_type == "twelfth_student" else "college_student"
    return MeResponse(email=user.email, role=role, student_type=student_type)
