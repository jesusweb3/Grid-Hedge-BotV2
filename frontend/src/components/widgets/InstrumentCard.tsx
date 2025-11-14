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

  if (!instrument) {
  return <div className="instrument-card empty" />;
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

  const handleTpVolumeChange = (index: number, value: number) => {
    const [tp1, tp2] = validateTpVolumes(
      index === 0 ? value : instrument.tpLevels[0].volumePercent,
      index === 1 ? value : instrument.tpLevels[1].volumePercent,
      index === 0
    );

    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[0] = { ...newTpLevels[0], volumePercent: tp1 };
    newTpLevels[1] = { ...newTpLevels[1], volumePercent: tp2 };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
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
        <h2>Актив: {instrument.symbol}</h2>
        <ToggleSwitch
          checked={instrument.isActive}
          onChange={handleActivityToggle}
          disabled={false}
        />
      </div>

      <div className="card-content">
        <section className="section">
          <h3>Настройки позиции</h3>
          <div className="form-group">
            <label>Цена входа (USDT)</label>
            <input
              type="number"
              value={instrument.entryPriceUsdt}
              onChange={(e) => handleEntryPriceChange(Number(e.target.value))}
              step={instrument.tickSize}
              disabled={instrument.isActive}
            />
          </div>
          <div className="form-group">
            <label>Объём входа (USDT)</label>
            <input
              type="number"
              value={instrument.entryVolumeUsdt}
              onChange={(e) => handleEntryVolumeChange(Number(e.target.value))}
              step="0.01"
              disabled={instrument.isActive}
            />
          </div>
        </section>

        <div className="row">
          <section className="section flex1">
            <h3>Take Profit</h3>

            <div className="tp-level">
              <h4>TP1</h4>
              <div className="form-group">
                <label>Шаг (USDT)</label>
                <input
                  type="number"
                  value={instrument.tpLevels[0].stepUsdt}
                  onChange={(e) => handleTpStepChange(0, Number(e.target.value))}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Объём (%)</label>
                <input
                  type="number"
                  value={instrument.tpLevels[0].volumePercent}
                  onChange={(e) => handleTpVolumeChange(0, Number(e.target.value))}
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
                <label>Шаг (USDT)</label>
                <input
                  type="number"
                  value={instrument.tpLevels[1].stepUsdt}
                  onChange={(e) => handleTpStepChange(1, Number(e.target.value))}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Объём (%)</label>
                <input
                  type="number"
                  value={instrument.tpLevels[1].volumePercent}
                  onChange={(e) => handleTpVolumeChange(1, Number(e.target.value))}
                  min="1"
                  max="99"
                  step="0.1"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          </section>

          <section className="section flex1">
            <h3>Stop Loss</h3>

            <div className="sl-side">
              <h4>Long</h4>
              <div className="form-group">
                <label>Количество (макс 10)</label>
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
                <label>Шаг (USDT)</label>
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
                <label>Количество (макс 10)</label>
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
                <label>Шаг (USDT)</label>
                <input
                  type="number"
                  value={instrument.slShort.stepUsdt}
                  onChange={(e) => handleSlStepChange('short', Number(e.target.value))}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          </section>
        </div>

        <section className="section">
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
              Включить доливку
            </label>
          </div>

          {instrument.refill.enabled && (
            <>
              <div className="row">
                <div className="form-group flex1">
                  <label>Long цена (USDT)</label>
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
                <div className="form-group flex1">
                  <label>Long объём (USDT)</label>
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
              </div>

              <div className="row">
                <div className="form-group flex1">
                  <label>Short цена (USDT)</label>
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
                <div className="form-group flex1">
                  <label>Short объём (USDT)</label>
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}