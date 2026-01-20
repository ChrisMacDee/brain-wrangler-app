import { useId } from 'react';

interface SliderProps {
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Label text displayed above the slider */
  label?: string;
  /** Unit suffix for the value display (e.g., "min", "pomodoros") */
  unit?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Additional class name for the container */
  className?: string;
  /** Format function for displaying the value */
  formatValue?: (value: number) => string;
}

/**
 * A clean, accessible slider component for numeric values.
 *
 * Displays the current value alongside the label and provides
 * smooth interaction for adjusting durations and intervals.
 */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = '',
  disabled = false,
  className = '',
  formatValue,
}: SliderProps) {
  const id = useId();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    onChange(newValue);
  };

  const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;

  // Calculate fill percentage for custom styling
  const fillPercentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={id}
            className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-300'}`}
          >
            {label}
          </label>
          <span
            className={`text-sm font-semibold tabular-nums ${
              disabled ? 'text-gray-500' : 'text-white'
            }`}
          >
            {displayValue}
          </span>
        </div>
      )}

      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={displayValue}
          className={`
            w-full h-2 rounded-full appearance-none cursor-pointer
            bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:active:scale-95
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
          `}
          style={{
            background: disabled
              ? undefined
              : `linear-gradient(to right, #6366f1 0%, #6366f1 ${fillPercentage}%, #374151 ${fillPercentage}%, #374151 100%)`,
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-500'}`}>
          {min}{unit ? ` ${unit}` : ''}
        </span>
        <span className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-500'}`}>
          {max}{unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  );
}

export default Slider;
