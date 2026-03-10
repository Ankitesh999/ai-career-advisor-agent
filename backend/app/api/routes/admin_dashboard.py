from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.schemas.admin_dashboard import AdminMetricsRead, AdminStudentRead
from app.services.admin_dashboard_service import AdminDashboardService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/metrics", response_model=AdminMetricsRead)
def get_admin_metrics(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> AdminMetricsRead:
    service = AdminDashboardService(db)
    return service.get_metrics()


@router.get("/students", response_model=list[AdminStudentRead])
def list_admin_students(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> list[AdminStudentRead]:
    service = AdminDashboardService(db)
    return service.list_students()
