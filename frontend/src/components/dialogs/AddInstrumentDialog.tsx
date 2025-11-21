import { useState } from 'react';
import type { AddInstrumentResult } from '../../stores/useInstrumentStore';
import { isValidSymbol } from '../../utils/validation';
import './AddInstrumentDialog.css';

interface AddInstrumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => Promise<AddInstrumentResult>;
}

export function AddInstrumentDialog({ isOpen, onClose, onAdd }: AddInstrumentDialogProps) {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestClose = () => {
    if (isSubmitting) {
      return;
    }
    setSymbol('');
    setError('');
    onClose();
  };

  const handleAdd = async () => {
    if (isSubmitting) return;

    const upperSymbol = symbol.toUpperCase().trim();

    if (!upperSymbol) {
      setError('Введите символ');
      return;
    }

    if (!isValidSymbol(upperSymbol)) {
      setError('Формат: XXXUSDT (например BTCUSDT)');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAdd(upperSymbol);
      if (result.success) {
        setSymbol('');
        setError('');
        onClose();
      } else {
        setError(result.error ?? 'Не удалось добавить инструмент');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить инструмент';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleAdd();
    }
    if (e.key === 'Escape') {
      handleRequestClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={handleRequestClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>Добавить инструмент</h2>

        <input
          type="text"
          placeholder="Например, BTCUSDT"
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isSubmitting}
        />

        {error && <p className="error-text">{error}</p>}

        <div className="dialog-buttons">
          <button className="btn-cancel" onClick={handleRequestClose} disabled={isSubmitting}>
            Отмена
          </button>
          <button className="btn-add" onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}
