import { create } from 'zustand';
import type { Instrument } from '../types/instrument';
import { createDefaultInstrument } from '../utils/createInstrument';

const STORAGE_KEY = 'hedgbot_state';

interface InstrumentStore {
  instruments: Instrument[];
  currentSymbol: string | null;
  addInstrument: (symbol: string) => boolean;
  removeInstrument: (symbol: string) => boolean;
  updateInstrument: (symbol: string, updates: Partial<Instrument>) => void;
  selectInstrument: (symbol: string | null) => void;
  getInstrument: (symbol: string) => Instrument | undefined;
  initialize: () => void;
}

// Вспомогательная функция для сохранения состояния
const persistState = (state: InstrumentStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    instruments: state.instruments,
    currentSymbol: state.currentSymbol,
  }));
};

export const useInstrumentStore = create<InstrumentStore>((set, get) => ({
  instruments: [],
  currentSymbol: null,

  addInstrument: (symbol) => {
    const { instruments } = get();

    if (instruments.some((i) => i.symbol === symbol)) {
      return false;
    }

    set((state) => ({
      instruments: [...state.instruments, createDefaultInstrument(symbol)],
    }));

    persistState(get());
    return true;
  },

  removeInstrument: (symbol) => {
    const { instruments, currentSymbol } = get();
    const filtered = instruments.filter((i) => i.symbol !== symbol);

    if (filtered.length === instruments.length) {
      return false;
    }

    set({
      instruments: filtered,
      currentSymbol: currentSymbol === symbol ? null : currentSymbol,
    });

    persistState(get());
    return true;
  },

  updateInstrument: (symbol, updates) => {
    set((state) => ({
      instruments: state.instruments.map((i) =>
        i.symbol === symbol ? { ...i, ...updates } : i
      ),
    }));

    persistState(get());
  },

  selectInstrument: (symbol) => {
    set({ currentSymbol: symbol });
    persistState(get());
  },

  getInstrument: (symbol) => {
    return get().instruments.find((i) => i.symbol === symbol);
  },

  initialize: () => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        set({
          instruments: data.instruments || [],
          currentSymbol: data.currentSymbol || null,
        });
        return;
      } catch (error) {
        console.error('Failed to parse stored state:', error);
      }
    }

    set({
      instruments: [],
      currentSymbol: null,
    });
  },
}));