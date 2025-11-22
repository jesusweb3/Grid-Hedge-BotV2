from __future__ import annotations

import asyncio

from app.models.settings import AppSettings, SettingsUpdatePayload
from app.services.state_storage import state_storage


class SettingsService:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._settings = AppSettings()

    async def load(self) -> AppSettings:
        raw = await state_storage.load_settings()
        settings = AppSettings(**raw)
        async with self._lock:
            self._settings = settings
        return settings

    def current(self) -> AppSettings:
        return self._settings.model_copy(deep=True)

    async def update(self, payload: SettingsUpdatePayload) -> AppSettings:
        async with self._lock:
            updated = self._settings.model_copy(deep=True)

            if payload.bybit_api_key is not None:
                updated.bybit_api_key = payload.bybit_api_key.strip()
            if payload.bybit_secret_key is not None:
                updated.bybit_secret_key = payload.bybit_secret_key.strip()

            self._settings = updated
            await state_storage.save_settings(updated.model_dump(by_alias=False))
            return updated.model_copy(deep=True)

    async def overwrite(self, settings: AppSettings) -> AppSettings:
        async with self._lock:
            self._settings = settings.model_copy(deep=True)
            await state_storage.save_settings(self._settings.model_dump(by_alias=False))
            return self._settings.model_copy(deep=True)


settings_service = SettingsService()


