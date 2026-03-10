from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CareerAnalysis(Base):
    __tablename__ = "career_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_profile_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    career_recommendations: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    skill_gaps: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    learning_roadmap: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    salary_insights: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    industry_trends: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
