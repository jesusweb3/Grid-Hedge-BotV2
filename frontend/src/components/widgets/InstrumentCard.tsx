import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useInstrumentStore } from '../../stores/useInstrumentStore';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { ValidationErrorDialog } from '../dialogs/ValidationErrorDialog';
import { validateTpVolumes, validateSlCounts, ensurePositive, validateInstrumentBeforeStart } from '../../utils/validation';
import { initializeEdits, resetEdits, type EditableFields } from '../../utils/edits';
import { PositionSection } from './sections/PositionSection';
import { TakeProfitSection } from './sections/TakeProfitSection';
import { StopLossSection } from './sections/StopLossSection';
import { RefillSection } from './sections/RefillSection';
import type { Instrument } from '../../types/instrument';
import './InstrumentCard.css';

interface InstrumentCardProps {
  instrument: Instrument | null;
}

function InstrumentCardComponent({ instrument }: InstrumentCardProps) {
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

  const handleActivityToggle = useCallback((checked: boolean) => {
    if (!instrument) return;
    if (checked) {
      const validation = validateInstrumentBeforeStart(instrument);
      if (!validation.valid) {
        setValidationError(validation.message || 'Ошибка валидации');
        return;
      }
    }
    updateInstrument(instrument.symbol, { isActive: checked });
  }, [instrument, updateInstrument]);

  const makeFieldHandler = useCallback((field: keyof EditableFields) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setEdits(prev => ({ ...prev, [field]: e.target.value }));
    },
  }), []);

  const makeSimpleNumberBlur = useCallback(
    (field: keyof EditableFields, updateFn: (value: number) => void) =>
      () => {
        const value = parseFloat(edits[field]) || 0;
        const positive = ensurePositive(value);
        updateFn(positive);
        setEdits(prev => ({ ...prev, [field]: positive.toString() }));
      },
    [edits]
  );

  const makeTpVolumeBlur = useCallback(
    (isFirstVolume: boolean) => () => {
      if (!instrument) return;
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
    },
    [instrument, edits, updateInstrument]
  );

  const makeSlCountBlur = useCallback(
    (isLongCount: boolean) => () => {
      if (!instrument) return;
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
    },
    [instrument, edits, updateInstrument]
  );

  const memoizedHandlers = useMemo(() => {
    if (!instrument) return null;
    return {
      handleEntryPriceBlur: makeSimpleNumberBlur('entryPrice', (value) => {
        updateInstrument(instrument.symbol, { entryPriceUsdt: value });
      }),
      handleEntryVolumeBlur: makeSimpleNumberBlur('entryVolume', (value) => {
        updateInstrument(instrument.symbol, { entryVolumeUsdt: value });
      }),
      handleTpStep1Blur: makeSimpleNumberBlur('tpStep1', (value) => {
        const newTpLevels = [...instrument.tpLevels];
        newTpLevels[0] = { ...newTpLevels[0], stepUsdt: value };
        updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
      }),
      handleTpStep2Blur: makeSimpleNumberBlur('tpStep2', (value) => {
        const newTpLevels = [...instrument.tpLevels];
        newTpLevels[1] = { ...newTpLevels[1], stepUsdt: value };
        updateInstrument(instrument.symbol, { tpLevels: newTpLevels as [any, any] });
      }),
      handleTp1VolumeBlur: makeTpVolumeBlur(true),
      handleTp2VolumeBlur: makeTpVolumeBlur(false),
      handleSlLongStepBlur: makeSimpleNumberBlur('slLongStep', (value) => {
        updateInstrument(instrument.symbol, {
          slLong: { ...instrument.slLong, stepUsdt: value },
        });
      }),
      handleSlShortStepBlur: makeSimpleNumberBlur('slShortStep', (value) => {
        updateInstrument(instrument.symbol, {
          slShort: { ...instrument.slShort, stepUsdt: value },
        });
      }),
      handleSlLongCountBlur: makeSlCountBlur(true),
      handleSlShortCountBlur: makeSlCountBlur(false),
      handleRefillLongPriceBlur: makeSimpleNumberBlur('refillLongPrice', (value) => {
        updateInstrument(instrument.symbol, {
          refill: { ...instrument.refill, longPriceUsdt: value },
        });
      }),
      handleRefillLongVolumeBlur: makeSimpleNumberBlur('refillLongVolume', (value) => {
        updateInstrument(instrument.symbol, {
          refill: { ...instrument.refill, longVolumeUsdt: value },
        });
      }),
      handleRefillShortPriceBlur: makeSimpleNumberBlur('refillShortPrice', (value) => {
        updateInstrument(instrument.symbol, {
          refill: { ...instrument.refill, shortPriceUsdt: value },
        });
      }),
      handleRefillShortVolumeBlur: makeSimpleNumberBlur('refillShortVolume', (value) => {
        updateInstrument(instrument.symbol, {
          refill: { ...instrument.refill, shortVolumeUsdt: value },
        });
      }),
    };
  }, [instrument, makeSimpleNumberBlur, makeTpVolumeBlur, makeSlCountBlur, updateInstrument]);

  const handleRefillToggle = useCallback((checked: boolean) => {
    if (!instrument) return;
    updateInstrument(instrument.symbol, {
      refill: { ...instrument.refill, enabled: checked },
    });
  }, [instrument, updateInstrument]);

  if (!instrument) {
    return <div className="instrument-card empty">Выберите инструмент</div>;
  }

  if (!memoizedHandlers) {
    return <div className="instrument-card empty">Ошибка загрузки</div>;
  }

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
        <PositionSection
          edits={edits}
          makeFieldHandler={makeFieldHandler}
          handlers={memoizedHandlers}
          instrument={instrument}
        />

        <div className="tp-sl-wrapper">
          <TakeProfitSection
            edits={edits}
            makeFieldHandler={makeFieldHandler}
            handlers={memoizedHandlers}
            instrument={instrument}
          />

          <StopLossSection
            edits={edits}
            makeFieldHandler={makeFieldHandler}
            handlers={memoizedHandlers}
            instrument={instrument}
          />
        </div>

        <RefillSection
          edits={edits}
          makeFieldHandler={makeFieldHandler}
          handlers={memoizedHandlers}
          instrument={instrument}
          onRefillToggle={handleRefillToggle}
        />
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

export const InstrumentCard = React.memo(InstrumentCardComponent);