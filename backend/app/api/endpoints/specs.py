from __future__ import annotations

from fastapi import APIRouter

from app.models.spec import SymbolSpecResponse
from app.services.bybit_specs import spec_registry

router = APIRouter()


@router.get("/", response_model=list[SymbolSpecResponse])
async def list_symbol_specs() -> list[SymbolSpecResponse]:
    return [
        SymbolSpecResponse(symbol=symbol, tick_size=data["tick_size"], qty_step=data["qty_step"])
        for symbol, data in spec_registry.all().items()
    ]

