import type { Instrument } from '../types/instrument';

/**
 * Создаёт новый инструмент со значениями по умолчанию
 */
export const createDefaultInstrument = (symbol: string): Instrument => {
  return {
    symbol,
    isActive: false,
    entryPriceUsdt: 0,
    entryVolumeUsdt: 0,
    priceDecimals: 2,
    tickSize: 0.01,
    tpLevels: [
      { stepUsdt: 0, volumePercent: 50 },
      { stepUsdt: 0, volumePercent: 50 },
    ],
    slLong: {
      count: 5,
      stepUsdt: 0,
    },
    slShort: {
      count: 5,
      stepUsdt: 0,
    },
    refill: {
      enabled: false,
      longPriceUsdt: 0,
      longVolumeUsdt: 0,
      shortPriceUsdt: 0,
      shortVolumeUsdt: 0,
    },
  };
};