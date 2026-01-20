import { useId } from 'react';

interface ToggleProps {
  /** Whether the toggle is on or off */
  checked: boolean;
  /** Callback when the toggle state changes */
  onChange: (checked: boolean) => void;
  /** Label text displayed next to the toggle */
  label?: string;
  /** Description text displayed below the label */
  description?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Additional class name for the container */
  className?: string;
}

/**
 * A clean, accessible toggle switch component.
 *
 * Features smooth animations and clear visual feedback for both
 * enabled and disabled states.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: ToggleProps) {
  const id = useId();

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={id}
              className={`block text-sm font-medium ${
                disabled ? 'text-gray-500' : 'text-gray-300'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`mt-0.5 text-xs ${disabled ? 'text-gray-600' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${checked ? 'bg-indigo-600' : 'bg-gray-600'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

export default Toggle;
