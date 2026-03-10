from __future__ import annotations

import logging

from app.schemas.industry_demand import IndustryDemandRead, IndustryTrend
from app.services.llm_client import LLMClient

logger = logging.getLogger(__name__)

FALLBACK_TRENDS = [
    IndustryTrend(trend="AI Agents", impact="high"),
    IndustryTrend(trend="LLM Engineering", impact="high"),
    IndustryTrend(trend="MLOps", impact="high"),
    IndustryTrend(trend="Vector Databases", impact="medium"),
    IndustryTrend(trend="Edge AI", impact="medium"),
]


class IndustryDemandService:
    def __init__(self) -> None:
        self.llm = LLMClient()

    def get_trends(self, year: int = 2026) -> IndustryDemandRead:
        try:
            trends = self._llm_trends(year)
            return IndustryDemandRead(year=year, trends=trends)
        except Exception as exc:
            logger.warning("Industry demand LLM failed, using fallback: %s", exc)
            return IndustryDemandRead(year=year, trends=FALLBACK_TRENDS)

    def _llm_trends(self, year: int) -> list[IndustryTrend]:
        system_prompt = (
            "You are a labor market analyst. Provide top industry skills trends "
            "for the given year. Return ONLY valid JSON."
        )
        user_prompt = (
            f"Return the top 5-7 skills in demand for {year}.\n"
            "Required JSON format:\n"
            "{\n"
            '  "trends":[{"trend":"AI Agents","impact":"high"}]\n'
            "}\n"
            "impact must be: high | medium | low."
        )
        data = self.llm.generate_industry_trends(system_prompt, user_prompt)
        trends = data.get("trends", [])
        return [IndustryTrend(**item) for item in trends if "trend" in item]
