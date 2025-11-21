from __future__ import annotations

import asyncio
from decimal import Decimal
from typing import Dict, Iterable, Optional

from app.models.instrument import (
    Instrument,
    InstrumentCreate,
    InstrumentUpdate,
    RefillConfig,
    StopLossConfig,
    TakeProfitLevel,
)
from app.services.bybit_specs import spec_registry


def _default_take_profit() -> list[TakeProfitLevel]:
    return [
        TakeProfitLevel(step_usdt=Decimal("0"), volume_percent=Decimal("50")),
        TakeProfitLevel(step_usdt=Decimal("0"), volume_percent=Decimal("50")),
    ]


def _default_stop_loss() -> StopLossConfig:
    return StopLossConfig(count=5, step_usdt=Decimal("0"))


def _default_refill() -> RefillConfig:
    return RefillConfig(
        enabled=False,
        long_price_usdt=Decimal("0"),
        long_volume_usdt=Decimal("0"),
        short_price_usdt=Decimal("0"),
        short_volume_usdt=Decimal("0"),
    )


def _create_instrument_from_spec(symbol: str, spec: Dict[str, str]) -> Instrument:
    tick_size = Decimal(spec["tick_size"])
    qty_step = Decimal(spec["qty_step"])

    price_decimals = max(0, -tick_size.as_tuple().exponent) if tick_size != 0 else 0
    volume_decimals = max(0, -qty_step.as_tuple().exponent) if qty_step != 0 else 0

    return Instrument(
        symbol=symbol,
        is_active=False,
        entry_price_usdt=Decimal("0"),
        entry_volume_usdt=Decimal("0"),
        price_decimals=price_decimals,
        volume_decimals=volume_decimals,
        tick_size=tick_size,
        qty_step=qty_step,
        tp_levels=_default_take_profit(),
        sl_long=_default_stop_loss(),
        sl_short=_default_stop_loss(),
        refill=_default_refill(),
    )


class InstrumentStore:
    def __init__(self) -> None:
        self._instruments: Dict[str, Instrument] = {}
        self._lock = asyncio.Lock()

    async def list(self) -> list[Instrument]:
        async with self._lock:
            return [instrument for instrument in self._instruments.values()]

    async def get(self, symbol: str) -> Optional[Instrument]:
        async with self._lock:
            return self._instruments.get(symbol.upper())

    async def create(self, payload: InstrumentCreate) -> Instrument:
        symbol = payload.symbol.upper()
        raw_spec = spec_registry.get(symbol)
        if not raw_spec:
            raise ValueError(f"Instrument {symbol} is not available on the exchange")

        async with self._lock:
            if symbol in self._instruments:
                raise ValueError(f"Instrument {symbol} already exists")

            instrument = _create_instrument_from_spec(symbol, raw_spec)
            self._instruments[symbol] = instrument
            return instrument

    async def delete(self, symbol: str) -> None:
        async with self._lock:
            symbol = symbol.upper()
            if symbol in self._instruments:
                del self._instruments[symbol]

    async def update(self, symbol: str, updates: InstrumentUpdate) -> Instrument:
        symbol = symbol.upper()
        async with self._lock:
            instrument = self._instruments.get(symbol)
            if instrument is None:
                raise ValueError(f"Instrument {symbol} not found")

            update_data = updates.model_dump(exclude_unset=True, by_alias=False)
            base_payload = instrument.model_dump(by_alias=False)
            base_payload.update(update_data)
            updated = Instrument(**base_payload)
            self._instruments[symbol] = updated
            return updated

    async def replace_all(self, instruments: Iterable[Instrument]) -> None:
        async with self._lock:
            self._instruments = {instrument.symbol: instrument for instrument in instruments}


instrument_store = InstrumentStore()

