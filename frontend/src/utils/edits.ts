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

/**
 * Инициализирует поля редактирования из инструмента
 */
export const initializeEdits = (instrument: Instrument): EditableFields => ({
  entryPrice: instrument.entryPriceUsdt.toString(),
  entryVolume: instrument.entryVolumeUsdt.toString(),
  tpStep1: instrument.tpLevels[0].stepUsdt.toString(),
  tpStep2: instrument.tpLevels[1].stepUsdt.toString(),
  tp1Volume: instrument.tpLevels[0].volumePercent.toString(),
  tp2Volume: instrument.tpLevels[1].volumePercent.toString(),
  slLongStep: instrument.slLong.stepUsdt.toString(),
  slShortStep: instrument.slShort.stepUsdt.toString(),
  slLongCount: instrument.slLong.count.toString(),
  slShortCount: instrument.slShort.count.toString(),
  refillLongPrice: instrument.refill.longPriceUsdt.toString(),
  refillLongVolume: instrument.refill.longVolumeUsdt.toString(),
  refillShortPrice: instrument.refill.shortPriceUsdt.toString(),
  refillShortVolume: instrument.refill.shortVolumeUsdt.toString(),
});

/**
 * Сбрасывает поля редактирования в пустое состояние
 */
export const resetEdits = (): EditableFields => ({ ...EMPTY_EDITS });