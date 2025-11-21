import React from 'react';
import type { Instrument } from '../../../types/instrument';
import type { EditableFields } from '../../../utils/edits';

interface StopLossSectionProps {
  edits: EditableFields;
  makeFieldHandler: (field: keyof EditableFields) => { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void };
  handlers: {
    handleSlLongStepBlur: () => void;
    handleSlShortStepBlur: () => void;
    handleSlLongCountBlur: () => void;
    handleSlShortCountBlur: () => void;
    [key: string]: () => void;
  };
  instrument: Instrument;
}

function StopLossSectionComponent({
  edits,
  makeFieldHandler,
  handlers,
  instrument,
}: StopLossSectionProps) {
  return (
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
            onBlur={handlers.handleSlLongCountBlur}
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
            onBlur={handlers.handleSlLongStepBlur}
            step={instrument.tickSize}
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
            onBlur={handlers.handleSlShortCountBlur}
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
            onBlur={handlers.handleSlShortStepBlur}
            step={instrument.tickSize}
            disabled={instrument.isActive}
          />
        </div>
      </div>
    </div>
  );
}

export const StopLossSection = React.memo(StopLossSectionComponent);