import React from 'react';
import type { Instrument } from '../../../types/instrument';
import type { EditableFields } from '../../../utils/edits';

interface PositionSectionProps {
  edits: EditableFields;
  makeFieldHandler: (field: keyof EditableFields) => { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void };
  handlers: {
    handleEntryPriceBlur: () => void;
    handleEntryVolumeBlur: () => void;
    [key: string]: () => void;
  };
  instrument: Instrument;
}

function PositionSectionComponent({
  edits,
  makeFieldHandler,
  handlers,
  instrument,
}: PositionSectionProps) {
  return (
    <section className="section">
      <h3>Позиция</h3>
      <div className="row">
        <div className="form-group">
          <label>Цена входа</label>
          <input
            type="number"
            value={edits.entryPrice}
            {...makeFieldHandler('entryPrice')}
            onBlur={handlers.handleEntryPriceBlur}
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
            onBlur={handlers.handleEntryVolumeBlur}
            step="0.01"
            disabled={instrument.isActive}
          />
        </div>
      </div>
    </section>
  );
}

export const PositionSection = React.memo(PositionSectionComponent);