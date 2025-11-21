from __future__ import annotations

from app.models.common import CamelModel


class SymbolSpecResponse(CamelModel):
    symbol: str
    tick_size: str
    qty_step: str

