from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from dotenv import load_dotenv
from pydantic import BaseModel, field_validator


def _getenv(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if value is None:
        return None
    value = value.strip()
    return value if value else default


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "t", "yes", "y", "on"}


class Settings(BaseModel):
    app_name: str = "AI Career Intelligence Agent"
    environment: Literal["local", "staging", "production"] = "local"
    debug: bool = False

    database_url: str
    db_echo: bool = False
    db_pool_size: int = 5
    db_max_overflow: int = 10

    auto_create_tables: bool = False
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    admin_emails: list[str] = []

    @field_validator("database_url")
    @classmethod
    def _validate_database_url(cls, value: str) -> str:
        if not value.lower().startswith("postgresql"):
            raise ValueError("DATABASE_URL must start with 'postgresql'.")
        return value

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv(override=False)

        database_url = _getenv("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL is required (see backend/.env.example).")

        return cls(
            app_name=_getenv("APP_NAME", "AI Career Intelligence Agent") or "AI Career Intelligence Agent",
            environment=_getenv("ENVIRONMENT", "local") or "local",
            debug=_parse_bool(_getenv("DEBUG"), default=False),
            database_url=database_url,
            db_echo=_parse_bool(_getenv("DB_ECHO"), default=False),
            db_pool_size=int(_getenv("DB_POOL_SIZE", "5") or "5"),
            db_max_overflow=int(_getenv("DB_MAX_OVERFLOW", "10") or "10"),
            auto_create_tables=_parse_bool(_getenv("AUTO_CREATE_TABLES"), default=False),
            gemini_api_key=_getenv("GEMINI_API_KEY"),
            gemini_model=_getenv("GEMINI_MODEL", "gemini-2.5-flash") or "gemini-2.5-flash",
            jwt_secret=_getenv("JWT_SECRET", "change-me") or "change-me",
            jwt_algorithm=_getenv("JWT_ALGORITHM", "HS256") or "HS256",
            access_token_expire_minutes=int(
                _getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60") or "60"
            ),
            admin_emails=[
                email.strip().lower()
                for email in (_getenv("ADMIN_EMAILS", "") or "").split(",")
                if email.strip()
            ],
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings.from_env()
