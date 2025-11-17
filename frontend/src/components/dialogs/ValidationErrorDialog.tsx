import './ValidationErrorDialog.css';

interface ValidationErrorDialogProps {
  isOpen: boolean;
  message: string;
  symbol: string;
  onClose: () => void;
}

export function ValidationErrorDialog({
  isOpen,
  message,
  symbol,
  onClose,
}: ValidationErrorDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content error-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Ошибка валидации</h2>
        <p className="error-message">
          Инструмент <strong>{symbol}</strong> не может быть запущен:<br />
          {message}
        </p>
        <p className="error-hint">Пожалуйста, исправьте параметр и попробуйте снова.</p>

        <div className="dialog-buttons">
          <button className="btn-close" onClick={onClose}>
            Понял
          </button>
        </div>
      </div>
    </div>
  );
}