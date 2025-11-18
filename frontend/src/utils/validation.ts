import type { Instrument } from '../types/instrument';

/**
 * Ограничивает значение в диапазон [min, max]
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Валидация и синхронизация объёмов TP так, чтобы их сумма была 100%
 */
export const validateTpVolumes = (
  tp1Volume: number,
  tp2Volume: number,
  changedTp1: boolean
): [number, number] => {
  const tp1Clamped = clamp(tp1Volume, 1, 99);
  const tp2Clamped = clamp(tp2Volume, 1, 99);

  const sum = tp1Clamped + tp2Clamped;

  if (Math.abs(sum - 100) < 1e-6) {
    return [tp1Clamped, tp2Clamped];
  }

  if (changedTp1) {
    return [tp1Clamped, clamp(100 - tp1Clamped, 1, 99)];
  }

  return [clamp(100 - tp2Clamped, 1, 99), tp2Clamped];
};

/**
 * Валидация и синхронизация количества SL (максимум 10 суммарно)
 */
export const validateSlCounts = (
  longCount: number,
  shortCount: number,
  changedLong: boolean
): [number, number] => {
  const longClamped = clamp(longCount, 1, 10);
  const shortClamped = clamp(shortCount, 1, 10);

  const sum = longClamped + shortClamped;

  if (sum <= 10) {
    return [longClamped, shortClamped];
  }

  if (changedLong) {
    return [longClamped, clamp(10 - longClamped, 1, 10)];
  }

  return [clamp(10 - shortClamped, 1, 10), shortClamped];
};

/**
 * Преобразует отрицательное значение в положительное
 */
export const ensurePositive = (value: number): number => Math.abs(value);

/**
 * Валидация символа инструмента (BTCUSDT, ETHUSDT и т.д.)
 */
export const isValidSymbol = (symbol: string): boolean => {
  return /^[A-Z]{3,12}USDT$/.test(symbol.toUpperCase());
};

/**
 * Проверка консистентности всех TP/SL настроек инструмента
 */
export const validateInstrumentConsistency = (instrument: Instrument): boolean => {
  if (instrument.tpLevels.length !== 2) {
    return false;
  }

  const tpSum = instrument.tpLevels[0].volumePercent + instrument.tpLevels[1].volumePercent;
  if (Math.abs(tpSum - 100) > 1e-6) {
    return false;
  }

  if (instrument.slLong.count < 1 || instrument.slShort.count < 1) {
    return false;
  }

  if (instrument.slLong.count + instrument.slShort.count > 10) {
    return false;
  }

  return true;
};

/**
 * Результат валидации при запуске инструмента
 */
export interface ValidationError {
  valid: boolean;
  message?: string;
  field?: string;
}

/**
 * Валидация инструмента перед запуском (активацией)
 */
export const validateInstrumentBeforeStart = (instrument: Instrument): ValidationError => {
  if (instrument.entryPriceUsdt === 0) {
    return {
      valid: false,
      message: 'Цена входа должна быть больше нуля',
      field: 'entryPriceUsdt',
    };
  }

  if (instrument.entryVolumeUsdt === 0) {
    return {
      valid: false,
      message: 'Объём входа должен быть больше нуля',
      field: 'entryVolumeUsdt',
    };
  }

  if (instrument.tpLevels[0].stepUsdt === 0) {
    return {
      valid: false,
      message: 'Шаг TP1 должен быть больше нуля',
      field: 'tp1Step',
    };
  }

  if (instrument.tpLevels[1].stepUsdt === 0) {
    return {
      valid: false,
      message: 'Шаг TP2 должен быть больше нуля',
      field: 'tp2Step',
    };
  }

  if (instrument.slLong.stepUsdt === 0) {
    return {
      valid: false,
      message: 'Шаг SL Long должен быть больше нуля',
      field: 'slLongStep',
    };
  }

  if (instrument.slShort.stepUsdt === 0) {
    return {
      valid: false,
      message: 'Шаг SL Short должен быть больше нуля',
      field: 'slShortStep',
    };
  }

  if (instrument.refill.enabled) {
    if (instrument.refill.longPriceUsdt === 0) {
      return {
        valid: false,
        message: 'Цена Long доливки должна быть больше нуля',
        field: 'refillLongPrice',
      };
    }

    if (instrument.refill.longVolumeUsdt === 0) {
      return {
        valid: false,
        message: 'Объём Long доливки должен быть больше нуля',
        field: 'refillLongVolume',
      };
    }

    if (instrument.refill.shortPriceUsdt === 0) {
      return {
        valid: false,
        message: 'Цена Short доливки должна быть больше нуля',
        field: 'refillShortPrice',
      };
    }

    if (instrument.refill.shortVolumeUsdt === 0) {
      return {
        valid: false,
        message: 'Объём Short доливки должен быть больше нуля',
        field: 'refillShortVolume',
      };
    }
  }

  return { valid: true };
};