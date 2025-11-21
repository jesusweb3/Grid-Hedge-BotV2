from __future__ import annotations

import logging
import warnings

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic._internal._generate_schema import UnsupportedFieldAttributeWarning

from app.api.router import api_router
from app.core.config import get_settings
from app.services.bybit_specs import spec_registry

warnings.filterwarnings("ignore", category=UnsupportedFieldAttributeWarning)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.on_event("startup")
    async def startup_event() -> None:
        try:
            await spec_registry.refresh()
            logger.info("Bybit specifications loaded")
        except Exception as exc:  # pragma: no cover - startup logging only
            logger.exception("Failed to load instrument specifications: %s", exc)
            raise

    @app.get("/health")
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router, prefix=settings.api_prefix)

    return app


app = create_app()

