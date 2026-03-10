from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings

SessionLocal: sessionmaker[Session] | None = None
_ENGINE: Engine | None = None


def init_engine(settings: Settings | None = None) -> Engine:
    global SessionLocal
    global _ENGINE
    settings = settings or get_settings()

    engine = create_engine(
        settings.database_url,
        echo=settings.db_echo,
        pool_pre_ping=True,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
    )

    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    _ENGINE = engine
    return engine


def _require_sessionmaker() -> sessionmaker[Session]:
    if SessionLocal is None:
        raise RuntimeError("DB not initialized. Call init_engine() during app startup.")
    return SessionLocal


def get_engine() -> Engine:
    if _ENGINE is None:
        raise RuntimeError("DB not initialized. Call init_engine() during app startup.")
    return _ENGINE


def create_session() -> Session:
    sm = _require_sessionmaker()
    return sm()
