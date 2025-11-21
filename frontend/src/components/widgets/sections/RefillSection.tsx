import React from 'react';
import type { Instrument } from '../../../types/instrument';
import type { EditableFields } from '../../../utils/edits';

interface RefillSectionProps {
  edits: EditableFields;
  makeFieldHandler: (field: keyof EditableFields) => { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void };
  handlers: {
    handleRefillLongPriceBlur: () => void;
    handleRefillLongVolumeBlur: () => void;
    handleRefillShortPriceBlur: () => void;
    handleRefillShortVolumeBlur: () => void;
    [key: string]: () => void;
  };
  instrument: Instrument;
  onRefillToggle: (checked: boolean) => void;
}

function RefillSectionComponent({
  edits,
  makeFieldHandler,
  handlers,
  instrument,
  onRefillToggle,
}: RefillSectionProps) {
  return (
    <div className="refill-section">
      <h3>Доливка</h3>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={instrument.refill.enabled}
            onChange={(e) => onRefillToggle(e.target.checked)}
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
              onBlur={handlers.handleRefillLongPriceBlur}
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
              onBlur={handlers.handleRefillLongVolumeBlur}
            step={instrument.qtyStep}
              disabled={instrument.isActive}
            />
          </div>
          <div className="form-group">
            <label>Short цена</label>
            <input
              type="number"
              value={edits.refillShortPrice}
              {...makeFieldHandler('refillShortPrice')}
              onBlur={handlers.handleRefillShortPriceBlur}
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
              onBlur={handlers.handleRefillShortVolumeBlur}
            step={instrument.qtyStep}
              disabled={instrument.isActive}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const RefillSection = React.memo(RefillSectionComponent);