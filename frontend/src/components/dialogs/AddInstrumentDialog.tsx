import { useState } from 'react';
import type { AddInstrumentResult } from '../../stores/useInstrumentStore';
import { isValidSymbol } from '../../utils/validation';
import './AddInstrumentDialog.css';

interface AddInstrumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => Promise<AddInstrumentResult>;
  onRequestSettings?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function AddInstrumentDialog({
  isOpen,
  onClose,
  onAdd,
  onRequestSettings,
  disabled = false,
  disabledMessage = 'Сначала настройте API ключи, затем добавьте инструмент.',
}: AddInstrumentDialogProps) {
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
    if (isSubmitting || disabled) return;

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
    if (disabled) {
      return;
    }
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

        {disabled ? (
          <p className="disabled-message">{disabledMessage}</p>
        ) : (
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
        )}

        {error && !disabled && <p className="error-text">{error}</p>}

        <div className="dialog-buttons">
          <button className="btn-cancel" onClick={handleRequestClose} disabled={isSubmitting}>
            Закрыть
          </button>
          <button
            className="btn-add"
            onClick={disabled ? onRequestSettings : handleAdd}
            disabled={isSubmitting || (disabled && !onRequestSettings)}
          >
            {disabled ? 'Настроить ключи' : isSubmitting ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}
