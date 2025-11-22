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
  settingsConfigured: boolean;
}

function InstrumentCardComponent({ instrument, settingsConfigured }: InstrumentCardProps) {
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

  const formatNumber = useCallback((value: number, decimals: number) => {
    if (Number.isNaN(value)) {
      return '';
    }
    if (decimals <= 0) {
      return value.toString();
    }
    return value.toFixed(decimals);
  }, []);

  const applyUpdate = useCallback((updates: Partial<Instrument>) => {
    if (!instrument) return;
    void updateInstrument(instrument.symbol, updates).catch((error: unknown) => {
      console.error('Failed to apply instrument update:', error);
      const message =
        error instanceof Error ? error.message : 'Не удалось обновить параметр. Попробуйте снова.';
      setValidationError(message);
    });
  }, [instrument, updateInstrument]);

  const handleActivityToggle = useCallback((checked: boolean) => {
    if (!instrument) return;
    if (checked) {
      if (!settingsConfigured) {
        setValidationError('Настройте API ключи, прежде чем запускать торговлю.');
        return;
      }
      const validation = validateInstrumentBeforeStart(instrument);
      if (!validation.valid) {
        setValidationError(validation.message || 'Ошибка валидации');
        return;
      }
    }
    applyUpdate({ isActive: checked });
  }, [instrument, applyUpdate, settingsConfigured]);

  const makeFieldHandler = useCallback((field: keyof EditableFields) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setEdits(prev => ({ ...prev, [field]: e.target.value }));
    },
  }), []);

  const makeSimpleNumberBlur = useCallback(
    (field: keyof EditableFields, decimals: number, updateFn: (value: number) => void) =>
      () => {
        const value = parseFloat(edits[field]) || 0;
        const positive = ensurePositive(value);
        updateFn(positive);
        setEdits(prev => ({ ...prev, [field]: formatNumber(positive, decimals) }));
      },
    [edits, formatNumber]
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
      applyUpdate({ tpLevels: newTpLevels as Instrument['tpLevels'] });

      setEdits(prev => ({
        ...prev,
        tp1Volume: validTp1.toString(),
        tp2Volume: validTp2.toString(),
      }));
    },
    [instrument, edits, applyUpdate]
  );

  const makeSlCountBlur = useCallback(
    (isLongCount: boolean) => () => {
      if (!instrument) return;
      const longCount = parseInt(edits.slLongCount) || 1;
      const shortCount = parseInt(edits.slShortCount) || 1;
      const [validLong, validShort] = validateSlCounts(longCount, shortCount, isLongCount);

      applyUpdate({
        slLong: { ...instrument.slLong, count: validLong },
        slShort: { ...instrument.slShort, count: validShort },
      });

      setEdits(prev => ({
        ...prev,
        slLongCount: validLong.toString(),
        slShortCount: validShort.toString(),
      }));
    },
    [instrument, edits, applyUpdate]
  );

  const memoizedHandlers = useMemo(() => {
    if (!instrument) return null;
    return {
      handleEntryPriceBlur: makeSimpleNumberBlur('entryPrice', instrument.priceDecimals, (value) => {
        applyUpdate({ entryPriceUsdt: value });
      }),
      handleEntryVolumeBlur: makeSimpleNumberBlur(
        'entryVolume',
        instrument.volumeDecimals,
        (value) => {
          applyUpdate({ entryVolumeUsdt: value });
        },
      ),
      handleTpStep1Blur: makeSimpleNumberBlur('tpStep1', instrument.priceDecimals, (value) => {
        const newTpLevels = [...instrument.tpLevels];
        newTpLevels[0] = { ...newTpLevels[0], stepUsdt: value };
        applyUpdate({ tpLevels: newTpLevels as Instrument['tpLevels'] });
      }),
      handleTpStep2Blur: makeSimpleNumberBlur('tpStep2', instrument.priceDecimals, (value) => {
        const newTpLevels = [...instrument.tpLevels];
        newTpLevels[1] = { ...newTpLevels[1], stepUsdt: value };
        applyUpdate({ tpLevels: newTpLevels as Instrument['tpLevels'] });
      }),
      handleTp1VolumeBlur: makeTpVolumeBlur(true),
      handleTp2VolumeBlur: makeTpVolumeBlur(false),
      handleSlLongStepBlur: makeSimpleNumberBlur('slLongStep', instrument.priceDecimals, (value) => {
        applyUpdate({
          slLong: { ...instrument.slLong, stepUsdt: value },
        });
      }),
      handleSlShortStepBlur: makeSimpleNumberBlur('slShortStep', instrument.priceDecimals, (value) => {
        applyUpdate({
          slShort: { ...instrument.slShort, stepUsdt: value },
        });
      }),
      handleSlLongCountBlur: makeSlCountBlur(true),
      handleSlShortCountBlur: makeSlCountBlur(false),
      handleRefillLongPriceBlur: makeSimpleNumberBlur('refillLongPrice', instrument.priceDecimals, (value) => {
        applyUpdate({
          refill: { ...instrument.refill, longPriceUsdt: value },
        });
      }),
      handleRefillLongVolumeBlur: makeSimpleNumberBlur(
        'refillLongVolume',
        instrument.volumeDecimals,
        (value) => {
          applyUpdate({
          refill: { ...instrument.refill, longVolumeUsdt: value },
        });
        },
      ),
      handleRefillShortPriceBlur: makeSimpleNumberBlur('refillShortPrice', instrument.priceDecimals, (value) => {
        applyUpdate({
          refill: { ...instrument.refill, shortPriceUsdt: value },
        });
      }),
      handleRefillShortVolumeBlur: makeSimpleNumberBlur(
        'refillShortVolume',
        instrument.volumeDecimals,
        (value) => {
          applyUpdate({
          refill: { ...instrument.refill, shortVolumeUsdt: value },
        });
        },
      ),
    };
  }, [instrument, makeSimpleNumberBlur, makeTpVolumeBlur, makeSlCountBlur, applyUpdate]);

  const handleRefillToggle = useCallback((checked: boolean) => {
    if (!instrument) return;
    applyUpdate({
      refill: { ...instrument.refill, enabled: checked },
    });
  }, [instrument, applyUpdate]);

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
          disabled={!settingsConfigured && !instrument.isActive}
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