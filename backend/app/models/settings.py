from __future__ import annotations

from typing import Optional

from pydantic import Field

from app.models.common import CamelModel


class AppSettings(CamelModel):
    bybit_api_key: str = ""
    bybit_secret_key: str = ""

    def is_configured(self) -> bool:
        return bool(self.bybit_api_key.strip() and self.bybit_secret_key.strip())


class SettingsStatus(CamelModel):
    configured: bool


class AdminPasswordPayload(CamelModel):
    password: str = Field(min_length=1, max_length=128)


class SettingsAuthorizeRequest(AdminPasswordPayload):
    pass


class SettingsUpdatePayload(AdminPasswordPayload):
    bybit_api_key: Optional[str] = None
    bybit_secret_key: Optional[str] = None


class SettingsResponse(AppSettings):
    pass



