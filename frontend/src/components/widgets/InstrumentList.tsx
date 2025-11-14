import { useInstrumentStore } from '../../stores/useInstrumentStore';
import './InstrumentList.css';

interface InstrumentListProps {
  onSelectSymbol: (symbol: string) => void;
  onAddClick: () => void;
  currentSymbol: string | null;
}

export function InstrumentList({
  onSelectSymbol,
  onAddClick,
  currentSymbol,
}: InstrumentListProps) {
  const instruments = useInstrumentStore((state) => state.instruments);
  const removeInstrument = useInstrumentStore((state) => state.removeInstrument);

  const handleDelete = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    if (confirm(`Удалить инструмент ${symbol}?`)) {
      removeInstrument(symbol);
    }
  };

  return (
    <div className="instrument-list">
      <button className="btn-add-instrument" onClick={onAddClick}>
        + Добавить инструмент
      </button>

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
                  title="Удалить"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}