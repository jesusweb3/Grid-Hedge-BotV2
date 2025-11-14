import { create } from 'zustand';
import type { Instrument } from '../types/instrument';
import { createDefaultInstrument } from '../utils/createInstrument';

const STORAGE_KEY = 'hedgbot_state';

interface InstrumentStore {
  // State
  instruments: Instrument[];
  currentSymbol: string | null;

  // Actions
  addInstrument: (symbol: string) => boolean;
  removeInstrument: (symbol: string) => boolean;
  updateInstrument: (symbol: string, updates: Partial<Instrument>) => void;
  selectInstrument: (symbol: string | null) => void;
  getInstrument: (symbol: string) => Instrument | undefined;
  initialize: () => void;
}

export const useInstrumentStore = create<InstrumentStore>((set, get) => ({
  instruments: [],
  currentSymbol: null,

  addInstrument: (symbol) => {
    const { instruments } = get();
    
    // Проверяем что такого инструмента ещё нет
    if (instruments.some((i) => i.symbol === symbol)) {
      return false;
    }

    // Добавляем новый инструмент
    set((state) => ({
      instruments: [...state.instruments, createDefaultInstrument(symbol)],
    }));

    // Сохраняем в localStorage
    const updated = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return true;
  },

  removeInstrument: (symbol) => {
    const { instruments, currentSymbol } = get();

    // Фильтруем инструмент
    const filtered = instruments.filter((i) => i.symbol !== symbol);

    // Если ничего не изменилось - инструмент не найден
    if (filtered.length === instruments.length) {
      return false;
    }

    // Обновляем состояние
    set({
      instruments: filtered,
      currentSymbol: currentSymbol === symbol ? null : currentSymbol,
    });

    // Сохраняем в localStorage
    const updated = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return true;
  },

  updateInstrument: (symbol, updates) => {
    set((state) => ({
      instruments: state.instruments.map((i) =>
        i.symbol === symbol ? { ...i, ...updates } : i
      ),
    }));

    // Сохраняем в localStorage
    const updated = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  selectInstrument: (symbol) => {
    set({ currentSymbol: symbol });

    // Сохраняем в localStorage
    const updated = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getInstrument: (symbol) => {
    return get().instruments.find((i) => i.symbol === symbol);
  },

  initialize: () => {
    // Пытаемся загрузить из localStorage
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

    // Если не загрузилось - инициализируем пустое состояние
    set({
      instruments: [],
      currentSymbol: null,
    });
  },
}));