import { useState } from 'react';
import { isValidSymbol } from '../../utils/validation';
import './AddInstrumentDialog.css';

interface AddInstrumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string) => void;
}

export function AddInstrumentDialog({ isOpen, onClose, onAdd }: AddInstrumentDialogProps) {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const upperSymbol = symbol.toUpperCase().trim();

    if (!upperSymbol) {
      setError('Введите символ');
      return;
    }

    if (!isValidSymbol(upperSymbol)) {
      setError('Формат: XXXUSDT (например BTCUSDT)');
      return;
    }

    onAdd(upperSymbol);
    setSymbol('');
    setError('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} />
      <div className="dialog-content">
        <h2>Добавить инструмент</h2>

        <input
          type="text"
          placeholder="Например, BTCUSDT"
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          autoFocus
        />

        {error && <p className="error-text">{error}</p>}

        <div className="dialog-buttons">
          <button className="btn-cancel" onClick={onClose}>
            Отмена
          </button>
          <button className="btn-add" onClick={handleAdd}>
            Добавить
          </button>
        </div>
      </div>
    </>
  );
}