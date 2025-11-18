import './ToggleSwitch.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`toggle-switch ${checked ? 'checked' : ''}`}
      aria-label="Toggle"
    />
  );
}