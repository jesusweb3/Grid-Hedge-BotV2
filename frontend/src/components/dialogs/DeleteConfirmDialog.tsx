import './DeleteConfirmDialog.css';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  symbol: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  symbol,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content delete-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Удалить инструмент</h2>
        <p className="delete-message">Вы действительно хотите удалить <strong>{symbol}</strong>?</p>

        <div className="dialog-buttons">
          <button className="btn-cancel" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn-delete-confirm" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}