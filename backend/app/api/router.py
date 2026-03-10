from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.career_analysis import router as career_analysis_router
from app.api.routes.health import router as health_router
from app.api.routes.student_profiles import router as student_profiles_router
from app.api.routes.users import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router, prefix="/api/v1")
api_router.include_router(chat_router, prefix="/api/v1")
api_router.include_router(users_router, prefix="/api/v1")
api_router.include_router(student_profiles_router, prefix="/api/v1")
api_router.include_router(career_analysis_router, prefix="/api/v1")
