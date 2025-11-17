import type { Instrument } from '../types/instrument';

/**
 * Валидация и синхронизация объёмов TP так, чтобы их сумма была 100%
 */
export const validateTpVolumes = (
  tp1Volume: number,
  tp2Volume: number,
  changedTp1: boolean
): [number, number] => {
  // Ограничиваем каждый в пределах 1-99
  const tp1Clamped = Math.max(1, Math.min(99, tp1Volume));
  const tp2Clamped = Math.max(1, Math.min(99, tp2Volume));

  const sum = tp1Clamped + tp2Clamped;

  // Если сумма уже 100 - возвращаем как есть
  if (Math.abs(sum - 100) < 1e-6) {
    return [tp1Clamped, tp2Clamped];
  }

  // Если изменился TP1 - корректируем TP2
  if (changedTp1) {
    return [tp1Clamped, Math.max(1, Math.min(99, 100 - tp1Clamped))];
  }

  // Если изменился TP2 - корректируем TP1
  return [Math.max(1, Math.min(99, 100 - tp2Clamped)), tp2Clamped];
};

/**
 * Валидация и синхронизация количества SL (максимум 10 суммарно)
 */
export const validateSlCounts = (
  longCount: number,
  shortCount: number,
  changedLong: boolean
): [number, number] => {
  const longClamped = Math.max(1, Math.min(10, longCount));
  const shortClamped = Math.max(1, Math.min(10, shortCount));

  const sum = longClamped + shortClamped;

  // Если сумма <= 10 - всё хорошо
  if (sum <= 10) {
    return [longClamped, shortClamped];
  }

  // Если превышает 10 - корректируем один из них
  if (changedLong) {
    return [longClamped, Math.max(1, 10 - longClamped)];
  }

  return [Math.max(1, 10 - shortClamped), shortClamped];
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
  // Должны быть ровно 2 TP уровня
  if (instrument.tpLevels.length !== 2) {
    return false;
  }

  // Сумма TP объёмов должна быть 100%
  const tpSum = instrument.tpLevels[0].volumePercent + instrument.tpLevels[1].volumePercent;
  if (Math.abs(tpSum - 100) > 1e-6) {
    return false;
  }

  // SL должны быть >= 1
  if (instrument.slLong.count < 1 || instrument.slShort.count < 1) {
    return false;
  }

  // SL суммарно должны быть <= 10
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
  // Проверяем что цена входа не равна нулю
  if (instrument.entryPriceUsdt === 0) {
    return {
      valid: false,
      message: 'Цена входа должна быть больше нуля',
      field: 'entryPriceUsdt',
    };
  }

  return { valid: true };
};