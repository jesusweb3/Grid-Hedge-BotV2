import { useState, useEffect } from 'react';
import { useInstrumentStore } from '../../stores/useInstrumentStore';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { validateTpVolumes, validateSlCounts } from '../../utils/validation';
import type { Instrument } from '../../types/instrument';
import './InstrumentCard.css';

interface InstrumentCardProps {
  instrument: Instrument | null;
}

export function InstrumentCard({ instrument }: InstrumentCardProps) {
  const updateInstrument = useInstrumentStore((state) => state.updateInstrument);
  
  // Локальное состояние для редактирования TP объёмов
  const [tp1VolumeEdit, setTp1VolumeEdit] = useState<string>('');
  const [tp2VolumeEdit, setTp2VolumeEdit] = useState<string>('');

  // Синхронизируем локальное состояние с инструментом
  useEffect(() => {
    if (instrument) {
      setTp1VolumeEdit(instrument.tpLevels[0].volumePercent.toString());
      setTp2VolumeEdit(instrument.tpLevels[1].volumePercent.toString());
    }
  }, [instrument?.symbol]);

  if (!instrument) {
    return <div className="instrument-card empty">Выберите инструмент</div>;
  }

  const handleActivityToggle = (checked: boolean) => {
    updateInstrument(instrument.symbol, { isActive: checked });
  };

  const handleEntryPriceChange = (value: number) => {
    updateInstrument(instrument.symbol, { entryPriceUsdt: value });
  };

  const handleEntryVolumeChange = (value: number) => {
    updateInstrument(instrument.symbol, { entryVolumeUsdt: value });
  };

  const handleTpStepChange = (index: number, value: number) => {
    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[index] = { ...newTpLevels[index], stepUsdt: value };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
  };

  const handleTp1VolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTp1VolumeEdit(e.target.value);
  };

  const handleTp2VolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTp2VolumeEdit(e.target.value);
  };

  const handleTp1VolumeBlur = () => {
    const value = parseFloat(tp1VolumeEdit) || 0;
    const [tp1, tp2] = validateTpVolumes(
      value,
      instrument.tpLevels[1].volumePercent,
      true
    );

    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[0] = { ...newTpLevels[0], volumePercent: tp1 };
    newTpLevels[1] = { ...newTpLevels[1], volumePercent: tp2 };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
    
    setTp1VolumeEdit(tp1.toString());
    setTp2VolumeEdit(tp2.toString());
  };

  const handleTp2VolumeBlur = () => {
    const value = parseFloat(tp2VolumeEdit) || 0;
    const [tp1, tp2] = validateTpVolumes(
      instrument.tpLevels[0].volumePercent,
      value,
      false
    );

    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[0] = { ...newTpLevels[0], volumePercent: tp1 };
    newTpLevels[1] = { ...newTpLevels[1], volumePercent: tp2 };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
    
    setTp1VolumeEdit(tp1.toString());
    setTp2VolumeEdit(tp2.toString());
  };

  const handleSlCountChange = (side: 'long' | 'short', value: number) => {
    const [longCount, shortCount] = validateSlCounts(
      side === 'long' ? value : instrument.slLong.count,
      side === 'short' ? value : instrument.slShort.count,
      side === 'long'
    );

    updateInstrument(instrument.symbol, {
      slLong: { ...instrument.slLong, count: longCount },
      slShort: { ...instrument.slShort, count: shortCount },
    });
  };

  const handleSlStepChange = (side: 'long' | 'short', value: number) => {
    if (side === 'long') {
      updateInstrument(instrument.symbol, {
        slLong: { ...instrument.slLong, stepUsdt: value },
      });
    } else {
      updateInstrument(instrument.symbol, {
        slShort: { ...instrument.slShort, stepUsdt: value },
      });
    }
  };

  return (
    <div className="instrument-card">
      <div className="card-header">
        <h2>{instrument.symbol}</h2>
        <ToggleSwitch
          checked={instrument.isActive}
          onChange={handleActivityToggle}
          disabled={false}
        />
      </div>

      <div className="card-content">
        {/* Настройки позиции */}
        <section className="section">
          <h3>Позиция</h3>
          <div className="row">
            <div className="form-group">
              <label>Цена входа</label>
              <input
                type="number"
                value={instrument.entryPriceUsdt}
                onChange={(e) => handleEntryPriceChange(Number(e.target.value))}
                step={instrument.tickSize}
                disabled={instrument.isActive}
              />
            </div>
            <div className="form-group">
              <label>Объём входа</label>
              <input
                type="number"
                value={instrument.entryVolumeUsdt}
                onChange={(e) => handleEntryVolumeChange(Number(e.target.value))}
                step="0.01"
                disabled={instrument.isActive}
              />
            </div>
          </div>
        </section>

        {/* TP и SL в 2 колонки */}
        <div className="tp-sl-wrapper">
          {/* Take Profit */}
          <div className="tp-block">
            <h3>Take Profit</h3>

            <div className="tp-level">
              <h4>TP1</h4>
              <div className="form-group">
                <label>Шаг</label>
                <input
                  type="number"
                  value={instrument.tpLevels[0].stepUsdt}
                  onChange={(e) => handleTpStepChange(0, Number(e.target.value))}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Объём %</label>
                <input
                  type="number"
                  value={tp1VolumeEdit}
                  onChange={handleTp1VolumeChange}
                  onBlur={handleTp1VolumeBlur}
                  min="1"
                  max="99"
                  step="0.1"
                  disabled={instrument.isActive}
                />
              </div>
            </div>

            <div className="tp-level">
              <h4>TP2</h4>
              <div className="form-group">
                <label>Шаг</label>
                <input
                  type="number"
                  value={instrument.tpLevels[1].stepUsdt}
                  onChange={(e) => handleTpStepChange(1, Number(e.target.value))}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Объём %</label>
                <input
                  type="number"
                  value={tp2VolumeEdit}
                  onChange={handleTp2VolumeChange}
                  onBlur={handleTp2VolumeBlur}
                  min="1"
                  max="99"
                  step="0.1"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          </div>

          {/* Stop Loss */}
          <div className="sl-block">
            <h3>Stop Loss</h3>

            <div className="sl-side">
              <h4>Long</h4>
              <div className="form-group">
                <label>Кол-во</label>
                <input
                  type="number"
                  value={instrument.slLong.count}
                  onChange={(e) => handleSlCountChange('long', Number(e.target.value))}
                  min="1"
                  max="10"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Шаг</label>
                <input
                  type="number"
                  value={instrument.slLong.stepUsdt}
                  onChange={(e) => handleSlStepChange('long', Number(e.target.value))}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
            </div>

            <div className="sl-side">
              <h4>Short</h4>
              <div className="form-group">
                <label>Кол-во</label>
                <input
                  type="number"
                  value={instrument.slShort.count}
                  onChange={(e) => handleSlCountChange('short', Number(e.target.value))}
                  min="1"
                  max="10"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Шаг</label>
                <input
                  type="number"
                  value={instrument.slShort.stepUsdt}
                  onChange={(e) => handleSlStepChange('short', Number(e.target.value))}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Доливка */}
        <div className="refill-section">
          <h3>Доливка</h3>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={instrument.refill.enabled}
                onChange={(e) =>
                  updateInstrument(instrument.symbol, {
                    refill: { ...instrument.refill, enabled: e.target.checked },
                  })
                }
                disabled={instrument.isActive}
              />
              Включить
            </label>
          </div>

          {instrument.refill.enabled && (
            <div className="refill-grid">
              <div className="form-group">
                <label>Long цена</label>
                <input
                  type="number"
                  value={instrument.refill.longPriceUsdt}
                  onChange={(e) =>
                    updateInstrument(instrument.symbol, {
                      refill: { ...instrument.refill, longPriceUsdt: Number(e.target.value) },
                    })
                  }
                  step={instrument.tickSize}
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Long объём</label>
                <input
                  type="number"
                  value={instrument.refill.longVolumeUsdt}
                  onChange={(e) =>
                    updateInstrument(instrument.symbol, {
                      refill: { ...instrument.refill, longVolumeUsdt: Number(e.target.value) },
                    })
                  }
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Short цена</label>
                <input
                  type="number"
                  value={instrument.refill.shortPriceUsdt}
                  onChange={(e) =>
                    updateInstrument(instrument.symbol, {
                      refill: { ...instrument.refill, shortPriceUsdt: Number(e.target.value) },
                    })
                  }
                  step={instrument.tickSize}
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Short объём</label>
                <input
                  type="number"
                  value={instrument.refill.shortVolumeUsdt}
                  onChange={(e) =>
                    updateInstrument(instrument.symbol, {
                      refill: { ...instrument.refill, shortVolumeUsdt: Number(e.target.value) },
                    })
                  }
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}