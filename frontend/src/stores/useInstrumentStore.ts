import { create } from 'zustand';
import type { Instrument } from '../types/instrument';
import type { SymbolSpec } from '../types/spec';
import { apiClient } from '../utils/apiClient';

export interface AddInstrumentResult {
  success: boolean;
  instrument?: Instrument;
  error?: string;
}

interface InstrumentStore {
  instruments: Instrument[];
  specs: Record<string, NormalizedSpec>;
  currentSymbol: string | null;
  specsLoaded: boolean;
  isInitializing: boolean;
  initialize: () => Promise<void>;
  addInstrument: (symbol: string) => Promise<AddInstrumentResult>;
  removeInstrument: (symbol: string) => Promise<boolean>;
  updateInstrument: (symbol: string, updates: Partial<Instrument>) => Promise<void>;
  selectInstrument: (symbol: string | null) => void;
  getInstrument: (symbol: string) => Instrument | undefined;
}

const parseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Не удалось выполнить запрос. Попробуйте снова.';
};

interface NormalizedSpec {
  symbol: string;
  tickSize: number;
  qtyStep: number;
  priceDecimals: number;
  volumeDecimals: number;
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const normalizeSpec = (spec: SymbolSpec): NormalizedSpec => {
  const tickSizeRaw = spec.tickSize.trim();
  const qtyStepRaw = spec.qtyStep.trim();

  const parseStep = (raw: string) => {
    const normalized = raw.replace(/[, ]/g, '');
    const decimals = normalized.includes('.') ? normalized.split('.')[1].length : 0;
    const numeric = Number(normalized);
    return {
      numeric: Number.isNaN(numeric) ? 0 : numeric,
      decimals,
    };
  };

  const tick = parseStep(tickSizeRaw);
  const qty = parseStep(qtyStepRaw);

  return {
    symbol: spec.symbol,
    tickSize: tick.numeric,
    qtyStep: qty.numeric,
    priceDecimals: tick.decimals,
    volumeDecimals: qty.decimals,
  };
};

const normalizeInstrument = (instrument: Instrument): Instrument => ({
  ...instrument,
  entryPriceUsdt: toNumber(instrument.entryPriceUsdt),
  entryVolumeUsdt: toNumber(instrument.entryVolumeUsdt),
  priceDecimals: Math.max(0, Math.round(toNumber(instrument.priceDecimals))),
  volumeDecimals: Math.max(0, Math.round(toNumber(instrument.volumeDecimals))),
  tickSize: toNumber(instrument.tickSize),
  qtyStep: toNumber(instrument.qtyStep),
  tpLevels: [
    {
      stepUsdt: toNumber(instrument.tpLevels[0]?.stepUsdt),
      volumePercent: toNumber(instrument.tpLevels[0]?.volumePercent),
    },
    {
      stepUsdt: toNumber(instrument.tpLevels[1]?.stepUsdt),
      volumePercent: toNumber(instrument.tpLevels[1]?.volumePercent),
    },
  ],
  slLong: {
    count: Math.max(0, Math.round(toNumber(instrument.slLong.count))),
    stepUsdt: toNumber(instrument.slLong.stepUsdt),
  },
  slShort: {
    count: Math.max(0, Math.round(toNumber(instrument.slShort.count))),
    stepUsdt: toNumber(instrument.slShort.stepUsdt),
  },
  refill: {
    enabled: instrument.refill.enabled,
    longPriceUsdt: toNumber(instrument.refill.longPriceUsdt),
    longVolumeUsdt: toNumber(instrument.refill.longVolumeUsdt),
    shortPriceUsdt: toNumber(instrument.refill.shortPriceUsdt),
    shortVolumeUsdt: toNumber(instrument.refill.shortVolumeUsdt),
  },
});

export const useInstrumentStore = create<InstrumentStore>((set, get) => ({
  instruments: [],
  specs: {},
  currentSymbol: null,
  specsLoaded: false,
  isInitializing: false,

  initialize: async () => {
    if (get().specsLoaded || get().isInitializing) {
      return;
    }

    set({ isInitializing: true });

    try {
      const [specsResponse, instruments] = await Promise.all([
        apiClient.getSpecs(),
        apiClient.getInstruments(),
      ]);

      const specsRecord = specsResponse.reduce<Record<string, NormalizedSpec>>((acc, item) => {
        const normalized = normalizeSpec(item);
        acc[normalized.symbol] = normalized;
        return acc;
      }, {});

      const normalizedInstruments = instruments.map((instrument) => normalizeInstrument(instrument));

      set({
        specs: specsRecord,
        instruments: normalizedInstruments,
        currentSymbol: normalizedInstruments[0]?.symbol ?? null,
        specsLoaded: true,
        isInitializing: false,
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({
        specs: {},
        instruments: [],
        currentSymbol: null,
        specsLoaded: false,
        isInitializing: false,
      });
    }
  },

  addInstrument: async (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase().trim();

    if (!get().specsLoaded) {
      await get().initialize();

      let attempts = 0;
      while (!get().specsLoaded && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts += 1;
      }

      if (!get().specsLoaded) {
        return { success: false, error: 'Не удалось получить список инструментов. Попробуйте позже.' };
      }
    }

    const specExists = !!get().specs[normalizedSymbol];
    if (!specExists) {
      return {
        success: false,
        error: 'Такого инструмента нет среди USDT фьючерсов. Проверьте символ.',
      };
    }

    try {
      const instrument = normalizeInstrument(await apiClient.createInstrument(normalizedSymbol));
      set((state) => ({
        instruments: [...state.instruments, instrument],
      }));
      return { success: true, instrument };
    } catch (error) {
      const message = parseError(error);
      return { success: false, error: message };
    }
  },

  removeInstrument: async (symbol: string) => {
    try {
      await apiClient.deleteInstrument(symbol);
      set((state) => {
        const filtered = state.instruments.filter((instrument) => instrument.symbol !== symbol);
        const shouldResetSelection = state.currentSymbol === symbol;

        return {
          instruments: filtered,
          currentSymbol: shouldResetSelection ? filtered[0]?.symbol ?? null : state.currentSymbol,
        };
      });
      return true;
    } catch (error) {
      console.error('Failed to delete instrument:', error);
      return false;
    }
  },

  updateInstrument: async (symbol: string, updates: Partial<Instrument>) => {
    try {
      const updated = normalizeInstrument(await apiClient.updateInstrument(symbol, updates));
      set((state) => ({
        instruments: state.instruments.map((instrument) =>
          instrument.symbol === symbol ? updated : instrument,
        ),
      }));
    } catch (error) {
      console.error('Failed to update instrument:', error);
      throw error;
    }
  },

  selectInstrument: (symbol) => {
    set({ currentSymbol: symbol });
  },

  getInstrument: (symbol) => {
    return get().instruments.find((instrument) => instrument.symbol === symbol);
  },
}));