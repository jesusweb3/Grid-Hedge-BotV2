import { useState, useEffect } from 'react';
import { useInstrumentStore } from '../../stores/useInstrumentStore';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { ValidationErrorDialog } from '../dialogs/ValidationErrorDialog';
import { validateTpVolumes, validateSlCounts, ensurePositive, validateInstrumentBeforeStart } from '../../utils/validation';
import type { Instrument } from '../../types/instrument';
import './InstrumentCard.css';

interface InstrumentCardProps {
  instrument: Instrument | null;
}

export function InstrumentCard({ instrument }: InstrumentCardProps) {
  const updateInstrument = useInstrumentStore((state) => state.updateInstrument);
  
  // Локальное состояние для цены и объёма входа
  const [entryPriceEdit, setEntryPriceEdit] = useState<string>('');
  const [entryVolumeEdit, setEntryVolumeEdit] = useState<string>('');
  
  // Локальное состояние для TP шагов
  const [tpStep1Edit, setTpStep1Edit] = useState<string>('');
  const [tpStep2Edit, setTpStep2Edit] = useState<string>('');
  
  // Локальное состояние для редактирования TP объёмов
  const [tp1VolumeEdit, setTp1VolumeEdit] = useState<string>('');
  const [tp2VolumeEdit, setTp2VolumeEdit] = useState<string>('');
  
  // Локальное состояние для SL шагов
  const [slLongStepEdit, setSlLongStepEdit] = useState<string>('');
  const [slShortStepEdit, setSlShortStepEdit] = useState<string>('');
  
  // Локальное состояние для редактирования SL счётчиков
  const [slLongCountEdit, setSlLongCountEdit] = useState<string>('');
  const [slShortCountEdit, setSlShortCountEdit] = useState<string>('');

  // Локальное состояние для доливки
  const [refillLongPriceEdit, setRefillLongPriceEdit] = useState<string>('');
  const [refillLongVolumeEdit, setRefillLongVolumeEdit] = useState<string>('');
  const [refillShortPriceEdit, setRefillShortPriceEdit] = useState<string>('');
  const [refillShortVolumeEdit, setRefillShortVolumeEdit] = useState<string>('');

  // Локальное состояние для ошибки валидации
  const [validationError, setValidationError] = useState<string | null>(null);

  // Синхронизируем локальное состояние с инструментом
  useEffect(() => {
    if (instrument) {
      setEntryPriceEdit(instrument.entryPriceUsdt.toString());
      setEntryVolumeEdit(instrument.entryVolumeUsdt.toString());
      setTpStep1Edit(instrument.tpLevels[0].stepUsdt.toString());
      setTpStep2Edit(instrument.tpLevels[1].stepUsdt.toString());
      setTp1VolumeEdit(instrument.tpLevels[0].volumePercent.toString());
      setTp2VolumeEdit(instrument.tpLevels[1].volumePercent.toString());
      setSlLongStepEdit(instrument.slLong.stepUsdt.toString());
      setSlShortStepEdit(instrument.slShort.stepUsdt.toString());
      setSlLongCountEdit(instrument.slLong.count.toString());
      setSlShortCountEdit(instrument.slShort.count.toString());
      setRefillLongPriceEdit(instrument.refill.longPriceUsdt.toString());
      setRefillLongVolumeEdit(instrument.refill.longVolumeUsdt.toString());
      setRefillShortPriceEdit(instrument.refill.shortPriceUsdt.toString());
      setRefillShortVolumeEdit(instrument.refill.shortVolumeUsdt.toString());
    }
  }, [instrument?.symbol]);

  if (!instrument) {
    return <div className="instrument-card empty">Выберите инструмент</div>;
  }

  const handleActivityToggle = (checked: boolean) => {
    // Если пытаемся включить - валидируем
    if (checked) {
      const validation = validateInstrumentBeforeStart(instrument);
      if (!validation.valid) {
        setValidationError(validation.message || 'Ошибка валидации');
        return; // Не включаем
      }
    }

    updateInstrument(instrument.symbol, { isActive: checked });
  };

  const handleEntryPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntryPriceEdit(e.target.value);
  };

  const handleEntryPriceBlur = () => {
    const value = parseFloat(entryPriceEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, { entryPriceUsdt: positiveValue });
    setEntryPriceEdit(positiveValue.toString());
  };

  const handleEntryVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntryVolumeEdit(e.target.value);
  };

  const handleEntryVolumeBlur = () => {
    const value = parseFloat(entryVolumeEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, { entryVolumeUsdt: positiveValue });
    setEntryVolumeEdit(positiveValue.toString());
  };

  const handleTpStep1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTpStep1Edit(e.target.value);
  };

  const handleTpStep1Blur = () => {
    const value = parseFloat(tpStep1Edit) || 0;
    const positiveValue = ensurePositive(value);
    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[0] = { ...newTpLevels[0], stepUsdt: positiveValue };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
    setTpStep1Edit(positiveValue.toString());
  };

  const handleTpStep2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTpStep2Edit(e.target.value);
  };

  const handleTpStep2Blur = () => {
    const value = parseFloat(tpStep2Edit) || 0;
    const positiveValue = ensurePositive(value);
    const newTpLevels = [...instrument.tpLevels];
    newTpLevels[1] = { ...newTpLevels[1], stepUsdt: positiveValue };
    updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
    setTpStep2Edit(positiveValue.toString());
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

  const handleSlLongStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlLongStepEdit(e.target.value);
  };

  const handleSlLongStepBlur = () => {
    const value = parseFloat(slLongStepEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, {
      slLong: { ...instrument.slLong, stepUsdt: positiveValue },
    });
    setSlLongStepEdit(positiveValue.toString());
  };

  const handleSlShortStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlShortStepEdit(e.target.value);
  };

  const handleSlShortStepBlur = () => {
    const value = parseFloat(slShortStepEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, {
      slShort: { ...instrument.slShort, stepUsdt: positiveValue },
    });
    setSlShortStepEdit(positiveValue.toString());
  };

  const handleSlLongCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlLongCountEdit(e.target.value);
  };

  const handleSlLongCountBlur = () => {
    const value = parseInt(slLongCountEdit) || 1;
    const [longCount, shortCount] = validateSlCounts(
      value,
      instrument.slShort.count,
      true
    );

    updateInstrument(instrument.symbol, {
      slLong: { ...instrument.slLong, count: longCount },
      slShort: { ...instrument.slShort, count: shortCount },
    });

    setSlLongCountEdit(longCount.toString());
    setSlShortCountEdit(shortCount.toString());
  };

  const handleSlShortCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlShortCountEdit(e.target.value);
  };

  const handleSlShortCountBlur = () => {
    const value = parseInt(slShortCountEdit) || 1;
    const [longCount, shortCount] = validateSlCounts(
      instrument.slLong.count,
      value,
      false
    );

    updateInstrument(instrument.symbol, {
      slLong: { ...instrument.slLong, count: longCount },
      slShort: { ...instrument.slShort, count: shortCount },
    });

    setSlLongCountEdit(longCount.toString());
    setSlShortCountEdit(shortCount.toString());
  };

  const handleRefillLongPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefillLongPriceEdit(e.target.value);
  };

  const handleRefillLongPriceBlur = () => {
    const value = parseFloat(refillLongPriceEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, longPriceUsdt: positiveValue },
    });
    setRefillLongPriceEdit(positiveValue.toString());
  };

  const handleRefillLongVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefillLongVolumeEdit(e.target.value);
  };

  const handleRefillLongVolumeBlur = () => {
    const value = parseFloat(refillLongVolumeEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, longVolumeUsdt: positiveValue },
    });
    setRefillLongVolumeEdit(positiveValue.toString());
  };

  const handleRefillShortPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefillShortPriceEdit(e.target.value);
  };

  const handleRefillShortPriceBlur = () => {
    const value = parseFloat(refillShortPriceEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, shortPriceUsdt: positiveValue },
    });
    setRefillShortPriceEdit(positiveValue.toString());
  };

  const handleRefillShortVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefillShortVolumeEdit(e.target.value);
  };

  const handleRefillShortVolumeBlur = () => {
    const value = parseFloat(refillShortVolumeEdit) || 0;
    const positiveValue = ensurePositive(value);
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, shortVolumeUsdt: positiveValue },
    });
    setRefillShortVolumeEdit(positiveValue.toString());
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
                value={entryPriceEdit}
                onChange={handleEntryPriceChange}
                onBlur={handleEntryPriceBlur}
                step={instrument.tickSize}
                disabled={instrument.isActive}
              />
            </div>
            <div className="form-group">
              <label>Объём входа</label>
              <input
                type="number"
                value={entryVolumeEdit}
                onChange={handleEntryVolumeChange}
                onBlur={handleEntryVolumeBlur}
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
                  value={tpStep1Edit}
                  onChange={handleTpStep1Change}
                  onBlur={handleTpStep1Blur}
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
                  value={tpStep2Edit}
                  onChange={handleTpStep2Change}
                  onBlur={handleTpStep2Blur}
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
                  value={slLongCountEdit}
                  onChange={handleSlLongCountChange}
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
                  value={slLongStepEdit}
                  onChange={handleSlLongStepChange}
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
                  value={slShortCountEdit}
                  onChange={handleSlShortCountChange}
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
                  value={slShortStepEdit}
                  onChange={handleSlShortStepChange}
                  onBlur={handleSlShortStepBlur}
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
                  value={refillLongPriceEdit}
                  onChange={handleRefillLongPriceChange}
                  onBlur={handleRefillLongPriceBlur}
                  step={instrument.tickSize}
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Long объём</label>
                <input
                  type="number"
                  value={refillLongVolumeEdit}
                  onChange={handleRefillLongVolumeChange}
                  onBlur={handleRefillLongVolumeBlur}
                  step="0.01"
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Short цена</label>
                <input
                  type="number"
                  value={refillShortPriceEdit}
                  onChange={handleRefillShortPriceChange}
                  onBlur={handleRefillShortPriceBlur}
                  step={instrument.tickSize}
                  disabled={instrument.isActive}
                />
              </div>
              <div className="form-group">
                <label>Short объём</label>
                <input
                  type="number"
                  value={refillShortVolumeEdit}
                  onChange={handleRefillShortVolumeChange}
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