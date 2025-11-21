from __future__ import annotations

from decimal import Decimal
from typing import List, Optional

from pydantic import Field, ValidationInfo, field_validator, model_validator

from app.models.common import CamelModel


class TakeProfitLevel(CamelModel):
    step_usdt: Decimal = Field(gt=Decimal("-1"))
    volume_percent: Decimal = Field(ge=Decimal("0"), le=Decimal("100"))


class StopLossConfig(CamelModel):
    count: int = Field(ge=1, le=10)
    step_usdt: Decimal = Field(ge=Decimal("0"))


class RefillConfig(CamelModel):
    enabled: bool = False
    long_price_usdt: Decimal = Field(ge=Decimal("0"))
    long_volume_usdt: Decimal = Field(ge=Decimal("0"))
    short_price_usdt: Decimal = Field(ge=Decimal("0"))
    short_volume_usdt: Decimal = Field(ge=Decimal("0"))


class InstrumentBase(CamelModel):
    symbol: str
    is_active: bool = False
    entry_price_usdt: Decimal = Field(ge=Decimal("0"))
    entry_volume_usdt: Decimal = Field(ge=Decimal("0"))
    price_decimals: int = Field(ge=0, le=10)
    volume_decimals: int = Field(ge=0, le=10)
    tick_size: Decimal = Field(gt=Decimal("0"))
    qty_step: Decimal = Field(gt=Decimal("0"))
    tp_levels: List[TakeProfitLevel]
    sl_long: StopLossConfig
    sl_short: StopLossConfig
    refill: RefillConfig

    @model_validator(mode="after")
    def validate_consistency(self) -> "InstrumentBase":
        if len(self.tp_levels) != 2:
            raise ValueError("tp_levels must contain exactly 2 items")
        tp_sum = sum(level.volume_percent for level in self.tp_levels)
        if tp_sum != Decimal("100"):
            raise ValueError("Sum of TP volumes must be 100")
        total_sl = self.sl_long.count + self.sl_short.count
        if total_sl > 10:
            raise ValueError("Total SL count must be <= 10")
        return self


class InstrumentCreate(CamelModel):
    symbol: str

    @field_validator("symbol")
    @classmethod
    def uppercase_symbol(cls, value: str) -> str:
        return value.upper().strip()


class InstrumentUpdate(CamelModel):
    is_active: Optional[bool] = None
    entry_price_usdt: Optional[Decimal] = None
    entry_volume_usdt: Optional[Decimal] = None
    price_decimals: Optional[int] = Field(default=None, ge=0, le=10)
    volume_decimals: Optional[int] = Field(default=None, ge=0, le=10)
    tick_size: Optional[Decimal] = Field(default=None, gt=Decimal("0"))
    qty_step: Optional[Decimal] = Field(default=None, gt=Decimal("0"))
    tp_levels: Optional[List[TakeProfitLevel]] = None
    sl_long: Optional[StopLossConfig] = None
    sl_short: Optional[StopLossConfig] = None
    refill: Optional[RefillConfig] = None


class Instrument(InstrumentBase):
    pass

