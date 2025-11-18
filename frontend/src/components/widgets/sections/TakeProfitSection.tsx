import React from 'react';
import type { Instrument } from '../../../types/instrument';
import type { EditableFields } from '../../../utils/edits';

interface TakeProfitSectionProps {
  edits: EditableFields;
  makeFieldHandler: (field: keyof EditableFields) => { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void };
  handlers: {
    handleTpStep1Blur: () => void;
    handleTpStep2Blur: () => void;
    handleTp1VolumeBlur: () => void;
    handleTp2VolumeBlur: () => void;
    [key: string]: () => void;
  };
  instrument: Instrument;
}

function TakeProfitSectionComponent({
  edits,
  makeFieldHandler,
  handlers,
  instrument,
}: TakeProfitSectionProps) {
  return (
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
            onBlur={handlers.handleTpStep1Blur}
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
            onBlur={handlers.handleTp1VolumeBlur}
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
            onBlur={handlers.handleTpStep2Blur}
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
            onBlur={handlers.handleTp2VolumeBlur}
            min="1"
            max="99"
            step="0.1"
            disabled={instrument.isActive}
          />
        </div>
      </div>
    </div>
  );
}

export const TakeProfitSection = React.memo(TakeProfitSectionComponent);