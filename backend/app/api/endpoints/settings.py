from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException, status

from app.core.security import verify_admin_password
from app.models.settings import (
    SettingsAuthorizeRequest,
    SettingsResponse,
    SettingsStatus,
    SettingsUpdatePayload,
)
from app.services.bybit_specs import spec_registry
from app.services.settings_service import settings_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/status", response_model=SettingsStatus)
async def get_settings_status() -> SettingsStatus:
    current = settings_service.current()
    return SettingsStatus(configured=current.is_configured())


@router.post("/authorize", response_model=SettingsResponse)
async def authorize_settings(payload: SettingsAuthorizeRequest) -> SettingsResponse:
    if not verify_admin_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный пароль",
        )

    current = settings_service.current()
    return SettingsResponse(**current.model_dump(by_alias=False))


@router.put("/", response_model=SettingsResponse)
async def update_settings(payload: SettingsUpdatePayload) -> SettingsResponse:
    if not verify_admin_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный пароль",
        )

    previous = settings_service.current()
    updated = await settings_service.update(payload)

    prev_keys = (previous.bybit_api_key.strip(), previous.bybit_secret_key.strip())
    new_keys = (updated.bybit_api_key.strip(), updated.bybit_secret_key.strip())
    if new_keys != prev_keys:
        async def refresh_specs_background() -> None:
            try:
                await spec_registry.refresh()
            except Exception as exc:  # pragma: no cover - logging only
                logger.warning("Failed to refresh specs after settings update: %s", exc)

        asyncio.create_task(refresh_specs_background())

    return SettingsResponse(**updated.model_dump(by_alias=False))



