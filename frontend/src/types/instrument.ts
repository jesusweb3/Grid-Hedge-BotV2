// Один уровень Take Profit
export interface TakeProfitLevel {
  stepUsdt: number;
  volumePercent: number;
}

// Конфигурация Stop Loss
export interface StopLossConfig {
  count: number;
  stepUsdt: number;
}

// Конфигурация доливки
export interface RefillConfig {
  enabled: boolean;
  longPriceUsdt: number;
  longVolumeUsdt: number;
  shortPriceUsdt: number;
  shortVolumeUsdt: number;
}

// Основная модель инструмента
export interface Instrument {
  symbol: string;
  isActive: boolean;
  entryPriceUsdt: number;
  entryVolumeUsdt: number;
  priceDecimals: number;
  volumeDecimals: number;
  tickSize: number;
  qtyStep: number;
  tpLevels: [TakeProfitLevel, TakeProfitLevel]; // Ровно 2 уровня
  slLong: StopLossConfig;
  slShort: StopLossConfig;
  refill: RefillConfig;
}