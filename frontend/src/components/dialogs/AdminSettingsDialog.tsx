import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ApiSettings } from '../../types/settings';
import { apiClient } from '../../utils/apiClient';
import { EyeIcon, EyeOffIcon } from '../icons/EyeIcons';
import './AdminSettingsDialog.css';

interface AdminSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: (configured: boolean) => void;
}

type DialogStep = 'password' | 'form';

type SettingsStatusText = 'unknown' | 'configured' | 'not-configured';

const emptySettings: ApiSettings = {
  bybitApiKey: '',
  bybitSecretKey: '',
};

export function AdminSettingsDialog({ isOpen, onClose, onSettingsUpdated }: AdminSettingsDialogProps) {
  const [step, setStep] = useState<DialogStep>('password');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const [formState, setFormState] = useState<ApiSettings>(emptySettings);
  const [statusText, setStatusText] = useState<SettingsStatusText>('unknown');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep('password');
    setPassword('');
    setAuthError('');
    setIsAuthorizing(false);
    setFormState(emptySettings);
    setStatusText('unknown');
    setIsSaving(false);
    setShowApiKey(false);
    setSaveError('');
    setShowSecret(false);
  }, [isOpen]);

  const handleClose = () => {
    if (isAuthorizing || isSaving) {
      return;
    }
    onClose();
  };

  const handleAuthorize = async () => {
    if (isAuthorizing) return;
    if (!password.trim()) {
      setAuthError('Введите пароль администратора');
      return;
    }

    setIsAuthorizing(true);
    setAuthError('');
    try {
      const settings = await apiClient.authorizeSettings(password.trim());
      setFormState(settings);
      setStatusText(settings.bybitApiKey && settings.bybitSecretKey ? 'configured' : 'not-configured');
      setStep('form');
      setSaveError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось проверить пароль';
      setAuthError(message);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handlePasswordKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleAuthorize();
    }
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const payload = {
        password: password.trim(),
        bybitApiKey: formState.bybitApiKey.trim(),
        bybitSecretKey: formState.bybitSecretKey.trim(),
      };

      const updated = await apiClient.updateSettings(payload);
      setFormState(updated);
      const configured = Boolean(updated.bybitApiKey.trim() && updated.bybitSecretKey.trim());
      setStatusText(configured ? 'configured' : 'not-configured');
      onSettingsUpdated(configured);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить настройки';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSave();
    }
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const renderStatusText = () => {
    switch (statusText) {
      case 'configured':
        return 'ключи сохранены';
      case 'not-configured':
        return 'ключи не настроены';
      default:
        return 'ключи не настроены';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog-content admin-settings" onClick={(event) => event.stopPropagation()}>
        {step === 'password' ? (
          <>
            <h2>Настройки API ключей</h2>
            <p className="admin-settings__description">
              Введите пароль администратора, чтобы просмотреть или изменить ключи.
            </p>
            <input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setAuthError('');
              }}
              onKeyDown={handlePasswordKeyDown}
              autoFocus
              disabled={isAuthorizing}
            />
            {authError && <p className="error-text">{authError}</p>}
            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={handleClose} disabled={isAuthorizing}>
                Отмена
              </button>
              <button className="btn-add" onClick={handleAuthorize} disabled={isAuthorizing}>
                {isAuthorizing ? 'Проверка...' : 'Продолжить'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>API ключи Bybit</h2>
            <div className="admin-settings__field">
              <label className="admin-settings__label">API Key</label>
              <div className="admin-settings__input-wrapper">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formState.bybitApiKey}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      bybitApiKey: event.target.value,
                    }))
                  }
                  onKeyDown={handleFormKeyDown}
                  placeholder="Введите API Key"
                  disabled={isSaving}
                />
                <button
                  className="admin-settings__toggle-visibility"
                  type="button"
                  onClick={() => setShowApiKey((prev) => !prev)}
                  aria-label={showApiKey ? 'Скрыть API ключ' : 'Показать API ключ'}
                >
                  {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="admin-settings__field secret-field">
              <label className="admin-settings__label">Secret Key</label>
              <div className="admin-settings__input-wrapper">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={formState.bybitSecretKey}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      bybitSecretKey: event.target.value,
                    }))
                  }
                  onKeyDown={handleFormKeyDown}
                  placeholder="Введите Secret Key"
                  disabled={isSaving}
                />
                <button
                  className="admin-settings__toggle-visibility"
                  type="button"
                  onClick={() => setShowSecret((prev) => !prev)}
                  aria-label={showSecret ? 'Скрыть секретный ключ' : 'Показать секретный ключ'}
                >
                  {showSecret ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <p className="admin-settings__hint">Состояние: {renderStatusText()}</p>

            {saveError && <p className="error-text">{saveError}</p>}

            <div className="dialog-buttons">
              <button className="btn-cancel" onClick={handleClose} disabled={isSaving}>
                Закрыть
              </button>
              <button className="btn-add" onClick={handleSave} disabled={isSaving}>
                Сохранить
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


