from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.industry_demand import IndustryDemandRead
from app.services.industry_demand_service import IndustryDemandService

router = APIRouter(prefix="/industry-demand", tags=["industry-demand"])


@router.get("", response_model=IndustryDemandRead)
def get_industry_demand(
    _user=Depends(get_current_user),
) -> IndustryDemandRead:
    service = IndustryDemandService()
    return service.get_trends()
