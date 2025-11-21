import type { Instrument } from '../types/instrument';

export type EditableFields = {
  entryPrice: string;
  entryVolume: string;
  tpStep1: string;
  tpStep2: string;
  tp1Volume: string;
  tp2Volume: string;
  slLongStep: string;
  slShortStep: string;
  slLongCount: string;
  slShortCount: string;
  refillLongPrice: string;
  refillLongVolume: string;
  refillShortPrice: string;
  refillShortVolume: string;
};

export const EMPTY_EDITS: EditableFields = {
  entryPrice: '',
  entryVolume: '',
  tpStep1: '',
  tpStep2: '',
  tp1Volume: '',
  tp2Volume: '',
  slLongStep: '',
  slShortStep: '',
  slLongCount: '',
  slShortCount: '',
  refillLongPrice: '',
  refillLongVolume: '',
  refillShortPrice: '',
  refillShortVolume: '',
};

const formatWithDecimals = (value: number, decimals: number): string => {
  if (Number.isNaN(value)) {
    return '';
  }
  if (decimals <= 0) {
    return value.toString();
  }
  return value.toFixed(decimals);
};

/**
 * Инициализирует поля редактирования из инструмента
 */
export const initializeEdits = (instrument: Instrument): EditableFields => ({
  entryPrice: formatWithDecimals(instrument.entryPriceUsdt, instrument.priceDecimals),
  entryVolume: formatWithDecimals(instrument.entryVolumeUsdt, instrument.volumeDecimals),
  tpStep1: formatWithDecimals(instrument.tpLevels[0].stepUsdt, instrument.priceDecimals),
  tpStep2: formatWithDecimals(instrument.tpLevels[1].stepUsdt, instrument.priceDecimals),
  tp1Volume: instrument.tpLevels[0].volumePercent.toString(),
  tp2Volume: instrument.tpLevels[1].volumePercent.toString(),
  slLongStep: formatWithDecimals(instrument.slLong.stepUsdt, instrument.priceDecimals),
  slShortStep: formatWithDecimals(instrument.slShort.stepUsdt, instrument.priceDecimals),
  slLongCount: instrument.slLong.count.toString(),
  slShortCount: instrument.slShort.count.toString(),
  refillLongPrice: formatWithDecimals(instrument.refill.longPriceUsdt, instrument.priceDecimals),
  refillLongVolume: formatWithDecimals(instrument.refill.longVolumeUsdt, instrument.volumeDecimals),
  refillShortPrice: formatWithDecimals(instrument.refill.shortPriceUsdt, instrument.priceDecimals),
  refillShortVolume: formatWithDecimals(instrument.refill.shortVolumeUsdt, instrument.volumeDecimals),
});

/**
 * Сбрасывает поля редактирования в пустое состояние
 */
export const resetEdits = (): EditableFields => ({ ...EMPTY_EDITS });