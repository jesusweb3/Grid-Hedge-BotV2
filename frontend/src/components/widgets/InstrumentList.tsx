import { useState } from 'react';
import { useInstrumentStore } from '../../stores/useInstrumentStore';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import './InstrumentList.css';

interface InstrumentListProps {
  onSelectSymbol: (symbol: string) => void;
  onAddClick: () => void;
  onOpenSettings: () => void;
  currentSymbol: string | null;
  settingsConfigured: boolean;
}

export function InstrumentList({
  onSelectSymbol,
  onAddClick,
  onOpenSettings,
  currentSymbol,
  settingsConfigured,
}: InstrumentListProps) {
  const [deleteConfirmSymbol, setDeleteConfirmSymbol] = useState<string | null>(null);
  const instruments = useInstrumentStore((state) => state.instruments);
  const removeInstrument = useInstrumentStore((state) => state.removeInstrument);

  const handleAddClick = () => {
    onAddClick();
  };

  const handleDelete = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setDeleteConfirmSymbol(symbol);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmSymbol) return;

    void removeInstrument(deleteConfirmSymbol).then((success) => {
      if (!success) {
        console.error('Failed to delete instrument:', deleteConfirmSymbol);
      }
    }).catch((error) => {
      console.error('Failed to delete instrument:', error);
    }).finally(() => {
      setDeleteConfirmSymbol(null);
    });
  };

  return (
    <div className="instrument-list">
      <div className="action-buttons">
        <button
          className={`btn-add-instrument ${settingsConfigured ? '' : 'disabled'}`.trim()}
          onClick={handleAddClick}
          title={settingsConfigured ? '' : 'Сначала настройте API ключи'}
        >
          + Добавить инструмент
        </button>
      </div>

      <div className="list-container">
        {instruments.length === 0 ? (
          <p className="empty-message">Нет инструментов</p>
        ) : (
          <ul className="instruments">
            {instruments.map((instrument) => (
              <li
                key={instrument.symbol}
                className={`instrument-item ${
                  currentSymbol === instrument.symbol ? 'active' : ''
                }`}
                onClick={() => onSelectSymbol(instrument.symbol)}
              >
                <div className="item-header">
                  <span className={`status-dot ${instrument.isActive ? 'active' : 'inactive'}`} />
                  <span className="symbol">{instrument.symbol}</span>
                </div>

                <button
                  className="btn-delete"
                  onClick={(e) => handleDelete(e, instrument.symbol)}
                  title="Удалить инструмент"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="settings-footer">
        <button className="btn-settings" onClick={onOpenSettings}>
          <span>⚙ Настроить API ключи</span>
          <span className={`settings-status ${settingsConfigured ? 'active' : 'inactive'}`} />
        </button>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteConfirmSymbol !== null}
        symbol={deleteConfirmSymbol || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmSymbol(null)}
      />
    </div>
  );
}