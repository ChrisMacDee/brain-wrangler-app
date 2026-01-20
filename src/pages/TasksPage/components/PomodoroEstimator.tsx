import { useState } from 'react';
import { Circle } from 'lucide-react';

interface PomodoroEstimatorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function PomodoroEstimator({
  value,
  onChange,
  max = 8,
  showLabel = true,
  size = 'md',
  interactive = true,
}: PomodoroEstimatorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sizes = {
    sm: { icon: 'w-5 h-5', gap: 'gap-1', text: 'text-xs' },
    md: { icon: 'w-7 h-7', gap: 'gap-2', text: 'text-sm' },
    lg: { icon: 'w-9 h-9', gap: 'gap-3', text: 'text-base' },
  };

  const currentSize = sizes[size];

  const handleClick = (index: number) => {
    if (!interactive) return;
    // If clicking on the same value, toggle to 0, otherwise set to clicked value
    const newValue = index + 1;
    onChange(newValue === value ? 0 : newValue);
  };

  const getDisplayValue = () => {
    if (hoveredIndex !== null && interactive) {
      return hoveredIndex + 1;
    }
    return value;
  };

  const displayValue = getDisplayValue();

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex items-center ${currentSize.gap}`}
        role="slider"
        aria-valuemin={1}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label="Pomodoro estimate"
      >
        {Array.from({ length: max }, (_, index) => {
          const isFilled = index < displayValue;
          const isHovered = hoveredIndex !== null && index <= hoveredIndex;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onMouseEnter={() => interactive && setHoveredIndex(index)}
              onMouseLeave={() => interactive && setHoveredIndex(null)}
              disabled={!interactive}
              className={`
                relative transition-all duration-150 ease-out
                ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
                ${isFilled ? 'transform' : ''}
              `}
              aria-label={`${index + 1} pomodoro${index > 0 ? 's' : ''}`}
            >
              {/* Tomato/Pomodoro Icon */}
              <div
                className={`
                  ${currentSize.icon} relative
                  transition-all duration-200 ease-out
                  ${isFilled
                    ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                    : 'text-gray-600'
                  }
                  ${isHovered && interactive ? 'scale-110' : ''}
                `}
              >
                {/* Filled Tomato */}
                {isFilled ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`${currentSize.icon} transition-transform duration-200`}
                  >
                    {/* Tomato body */}
                    <ellipse cx="12" cy="14" rx="9" ry="8" fill="currentColor" />
                    {/* Stem */}
                    <path
                      d="M12 6 C12 4 14 2 16 3 C14 4 13 5 12 6"
                      fill="#22c55e"
                      stroke="#22c55e"
                      strokeWidth="0.5"
                    />
                    {/* Leaf */}
                    <path
                      d="M12 6 C10 5 8 4 7 3 C9 3.5 11 4.5 12 6"
                      fill="#22c55e"
                      stroke="#22c55e"
                      strokeWidth="0.5"
                    />
                    {/* Highlight */}
                    <ellipse cx="9" cy="12" rx="2" ry="2.5" fill="rgba(255,255,255,0.2)" />
                  </svg>
                ) : (
                  /* Empty Tomato Outline */
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`${currentSize.icon} transition-transform duration-200`}
                  >
                    <ellipse cx="12" cy="14" rx="9" ry="8" />
                    <path d="M12 6 C12 4 14 2 16 3 C14 4 13 5 12 6" />
                    <path d="M12 6 C10 5 8 4 7 3 C9 3.5 11 4.5 12 6" />
                  </svg>
                )}
              </div>

              {/* Pulse animation on click */}
              {isFilled && interactive && (
                <Circle
                  className={`
                    absolute inset-0 ${currentSize.icon}
                    text-rose-400 opacity-0 animate-ping
                  `}
                  style={{ animationDuration: '1s', animationIterationCount: '1' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {showLabel && (
        <p className={`mt-2 ${currentSize.text} text-gray-400 transition-colors duration-150`}>
          {displayValue === 0 ? (
            <span className="text-gray-500">Tap to select</span>
          ) : (
            <>
              <span className="text-rose-400 font-semibold">{displayValue}</span>
              {' '}
              {displayValue === 1 ? 'pomodoro' : 'pomodoros'}
              <span className="text-gray-500 ml-1">
                ({displayValue * 25} min)
              </span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export default PomodoroEstimator;
