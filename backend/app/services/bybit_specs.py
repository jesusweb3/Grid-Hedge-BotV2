from __future__ import annotations

import asyncio
import os
from typing import Dict, Optional

from dotenv import load_dotenv
from pybit.unified_trading import HTTP

from app.core.config import get_settings


def _str_to_bool(value: Optional[str]) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "y", "on"}


class SpecRegistry:
    def __init__(self) -> None:
        self._specs: Dict[str, Dict[str, str]] = {}
        self._lock = asyncio.Lock()

    async def refresh(self) -> Dict[str, Dict[str, str]]:
        async with self._lock:
            specs = await asyncio.to_thread(self._load_specs)
            self._specs = specs
            return specs

    def all(self) -> Dict[str, Dict[str, str]]:
        return dict(self._specs)

    def get(self, symbol: str) -> Optional[Dict[str, str]]:
        return self._specs.get(symbol.upper())

    @staticmethod
    def _load_specs() -> Dict[str, Dict[str, str]]:
        load_dotenv()
        settings = get_settings()

        env_flag = os.getenv("BYBIT_TESTNET")
        testnet = _str_to_bool(env_flag) if env_flag is not None else settings.bybit_testnet

        client = HTTP(testnet=testnet, timeout=10_000, recv_window=5_000)

        specs: Dict[str, Dict[str, str]] = {}
        cursor: Optional[str] = None

        while True:
            response = client.get_instruments_info(category="linear", cursor=cursor)
            if not isinstance(response, dict):
                raise RuntimeError(f"[get_instruments_info] unexpected response type: {response!r}")
            if response.get("retCode") != 0:
                raise RuntimeError(f"[get_instruments_info] Bybit API error: {response}")

            result = response.get("result") or {}
            instruments = result.get("list") or []

            for instrument in instruments:
                if instrument.get("quoteCoin") != "USDT":
                    continue
                if instrument.get("contractType") != "LinearPerpetual":
                    continue

                symbol = instrument.get("symbol")
                price = instrument.get("priceFilter") or {}
                lot = instrument.get("lotSizeFilter") or {}

                tick_size = price.get("tickSize")
                qty_step = lot.get("qtyStep")

                if symbol and tick_size is not None and qty_step is not None:
                    specs[str(symbol)] = {
                        "tick_size": str(tick_size),
                        "qty_step": str(qty_step),
                    }

            cursor = result.get("nextPageCursor")
            if not cursor:
                break

        return dict(sorted(specs.items(), key=lambda item: item[0]))


spec_registry = SpecRegistry()
