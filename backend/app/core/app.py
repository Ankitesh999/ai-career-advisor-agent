from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db.session import init_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    engine = init_engine(settings)
    app.state.db_engine = engine

    if settings.auto_create_tables:
        from app.db.base import Base
        import app.models  # noqa: F401

        Base.metadata.create_all(bind=engine)

    yield


def create_app() -> FastAPI:
    settings = get_settings()
    print(f"[DEBUG] CORS_ORIGINS from env: {settings.cors_origins}")
    print(f"[DEBUG] ENVIRONMENT: {settings.environment}")
    app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

    cors_origins = (
        settings.cors_origins if settings.cors_origins else ["http://localhost:3000"]
    )
    print(f"[DEBUG] CORS origins being used: {cors_origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app
