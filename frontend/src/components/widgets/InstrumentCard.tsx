import { useState, useEffect } from 'react';
import { useInstrumentStore } from '../../stores/useInstrumentStore';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { ValidationErrorDialog } from '../dialogs/ValidationErrorDialog';
import { validateTpVolumes, validateSlCounts, ensurePositive, validateInstrumentBeforeStart } from '../../utils/validation';
import { initializeEdits, resetEdits, type EditableFields } from '../../utils/edits';
import type { Instrument } from '../../types/instrument';
import './InstrumentCard.css';

interface InstrumentCardProps {
  instrument: Instrument | null;
}

export function InstrumentCard({ instrument }: InstrumentCardProps) {
  const updateInstrument = useInstrumentStore((state) => state.updateInstrument);
  const [edits, setEdits] = useState<EditableFields>(resetEdits());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (instrument) {
      setEdits(initializeEdits(instrument));
    } else {
      setEdits(resetEdits());
    }
  }, [instrument?.symbol]);

  if (!instrument) {
    return <div className="instrument-card empty">Выберите инструмент</div>;
  }

  const handleActivityToggle = (checked: boolean) => {
    if (checked) {
      const validation = validateInstrumentBeforeStart(instrument);
      if (!validation.valid) {
        setValidationError(validation.message || 'Ошибка валидации');
        return;
      }
    }
    updateInstrument(instrument.symbol, { isActive: checked });
  };

  const makeFieldHandler = (field: keyof EditableFields) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setEdits(prev => ({ ...prev, [field]: e.target.value }));
    },
  });

  const makeSimpleNumberBlur = (
    field: keyof EditableFields,
    updateFn: (value: number) => void
  ) => () => {
    const value = parseFloat(edits[field]) || 0;
    const positive = ensurePositive(value);
    updateFn(positive);
    setEdits(prev => ({ ...prev, [field]: positive.toString() }));
  };

  const makeTpVolumeBlur = (isFirstVolume: boolean) => () => {
    const tp1 = parseFloat(edits.tp1Volume) || 0;
    const tp2 = parseFloat(edits.tp2Volume) || 0;
    const [validTp1, validTp2] = validateTpVolumes(tp1, tp2, isFirstVolume);

    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[0] = { ...newTpLevels[0], volumePercent: validTp1 };
    newTpLevels[1] = { ...newTpLevels[1], volumePercent: validTp2 };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });

    setEdits(prev => ({
      ...prev,
      tp1Volume: validTp1.toString(),
      tp2Volume: validTp2.toString(),
    }));
  };

  const makeSlCountBlur = (isLongCount: boolean) => () => {
    const longCount = parseInt(edits.slLongCount) || 1;
    const shortCount = parseInt(edits.slShortCount) || 1;
    const [validLong, validShort] = validateSlCounts(longCount, shortCount, isLongCount);

    updateInstrument(instrument.symbol, {
      slLong: { ...instrument.slLong, count: validLong },
      slShort: { ...instrument.slShort, count: validShort },
    });

    setEdits(prev => ({
      ...prev,
      slLongCount: validLong.toString(),
      slShortCount: validShort.toString(),
    }));
  };

  const handleEntryPriceBlur = makeSimpleNumberBlur('entryPrice', (value) => {
    updateInstrument(instrument.symbol, { entryPriceUsdt: value });
  });

  const handleEntryVolumeBlur = makeSimpleNumberBlur('entryVolume', (value) => {
    updateInstrument(instrument.symbol, { entryVolumeUsdt: value });
  });

  const handleTpStep1Blur = makeSimpleNumberBlur('tpStep1', (value) => {
    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[0] = { ...newTpLevels[0], stepUsdt: value };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
  });

  const handleTpStep2Blur = makeSimpleNumberBlur('tpStep2', (value) => {
    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[1] = { ...newTpLevels[1], stepUsdt: value };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
  });

  const handleTp1VolumeBlur = makeTpVolumeBlur(true);
  const handleTp2VolumeBlur = makeTpVolumeBlur(false);

  const handleSlLongStepBlur = makeSimpleNumberBlur('slLongStep', (value) => {
    updateInstrument(instrument.symbol, {
      slLong: { ...instrument.slLong, stepUsdt: value },
    });
  });

  const handleSlShortStepBlur = makeSimpleNumberBlur('slShortStep', (value) => {
    updateInstrument(instrument.symbol, {
      slShort: { ...instrument.slShort, stepUsdt: value },
    });
  });

  const handleSlLongCountBlur = makeSlCountBlur(true);
  const handleSlShortCountBlur = makeSlCountBlur(false);

  const handleRefillLongPriceBlur = makeSimpleNumberBlur('refillLongPrice', (value) => {
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, longPriceUsdt: value },
    });
  });

  const handleRefillLongVolumeBlur = makeSimpleNumberBlur('refillLongVolume', (value) => {
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, longVolumeUsdt: value },
    });
  });

  const handleRefillShortPriceBlur = makeSimpleNumberBlur('refillShortPrice', (value) => {
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, shortPriceUsdt: value },
    });
  });

  const handleRefillShortVolumeBlur = makeSimpleNumberBlur('refillShortVolume', (value) => {
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, shortVolumeUsdt: value },
    });
  });

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
        <section className="section">
          <h3>Позиция</h3>
          <div className="row">
            <div className="form-group">
              <label>Цена входа</label>
              <input
                type="number"
                value={edits.entryPrice}
                {...makeFieldHandler('entryPrice')}
                onBlur={handleEntryPriceBlur}
                step={instrument.tickSize}
                disabled={instrument.isActive}
              />
            </div>
            <div className="form-group">
              <label>Объём входа</label>
              <input
                type="number"
                value={edits.entryVolume}
                {...makeFieldHandler('entryVolume')}
                onBlur={handleEntryVolumeBlur}
                step="0.01"
                disabled={instrument.isActive}
              />
            </div>
          </div>
        </section>

        <div className="tp-sl-wrapper">
          <div className="tp-block">
            <h3>Take Profit</h3>

            <div className="tp-level">
              <h4>TP1</h4>
              <div className="form-group">
                <label>Шаг</label>
                <input
                  type="number"
                  value={edits.tpStep1}
                  {...makeFieldHandler('tpStep1')}
                  onBlur={handleTpStep1Blur}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Объём %</label>
                <input
                  type="number"
                  value={edits.tp1Volume}
                  {...makeFieldHandler('tp1Volume')}
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
                  value={edits.tpStep2}
                  {...makeFieldHandler('tpStep2')}
                  onBlur={handleTpStep2Blur}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Объём %</label>
                <input
                  type="number"
                  value={edits.tp2Volume}
                  {...makeFieldHandler('tp2Volume')}
                  onBlur={handleTp2VolumeBlur}
                  min="1"
                  max="99"
                  step="0.1"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          </div>

          <div className="sl-block">
            <h3>Stop Loss</h3>

            <div className="sl-side">
              <h4>Long</h4>
              <div className="form-group">
                <label>Кол-во</label>
                <input
                  type="number"
                  value={edits.slLongCount}
                  {...makeFieldHandler('slLongCount')}
                  onBlur={handleSlLongCountBlur}
                  min="1"
                  max="10"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Шаг</label>
                <input
                  type="number"
                  value={edits.slLongStep}
                  {...makeFieldHandler('slLongStep')}
                  onBlur={handleSlLongStepBlur}
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
                  value={edits.slShortCount}
                  {...makeFieldHandler('slShortCount')}
                  onBlur={handleSlShortCountBlur}
                  min="1"
                  max="10"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Шаг</label>
                <input
                  type="number"
                  value={edits.slShortStep}
                  {...makeFieldHandler('slShortStep')}
                  onBlur={handleSlShortStepBlur}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          </div>
        </div>

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
                  value={edits.refillLongPrice}
                  {...makeFieldHandler('refillLongPrice')}
                  onBlur={handleRefillLongPriceBlur}
                  step={instrument.tickSize}
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Long объём</label>
                <input
                  type="number"
                  value={edits.refillLongVolume}
                  {...makeFieldHandler('refillLongVolume')}
                  onBlur={handleRefillLongVolumeBlur}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Short цена</label>
                <input
                  type="number"
                  value={edits.refillShortPrice}
                  {...makeFieldHandler('refillShortPrice')}
                  onBlur={handleRefillShortPriceBlur}
                  step={instrument.tickSize}
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Short объём</label>
                <input
                  type="number"
                  value={edits.refillShortVolume}
                  {...makeFieldHandler('refillShortVolume')}
                  onBlur={handleRefillShortVolumeBlur}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ValidationErrorDialog
        isOpen={validationError !== null}
        message={validationError || ''}
        symbol={instrument.symbol}
        onClose={() => setValidationError(null)}
      />
    </div>
  );
}