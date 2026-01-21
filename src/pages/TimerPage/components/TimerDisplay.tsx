import { useStore } from '../../../store';
import {
  selectFormattedTime,
  selectTimerProgress,
  selectTimerMode,
  selectTimerStatus,
} from '../../../store/selectors/timerSelectors';
import { TimerMode, TimerStatus } from '../../../types';

interface TimerDisplayProps {
  size?: number;
}

export function TimerDisplay({ size = 280 }: TimerDisplayProps) {
  const formattedTime = useStore(selectFormattedTime);
  const progress = useStore(selectTimerProgress);
  const mode = useStore(selectTimerMode);
  const status = useStore(selectTimerStatus);

  // SVG circle properties
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  // Mode-based colors - calm but distinct
  const getModeColors = () => {
    switch (mode) {
      case TimerMode.WORK:
        return {
          primary: 'stroke-rose-500',
          secondary: 'stroke-rose-500/20',
          glow: 'drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]',
          textColor: 'text-rose-500',
          label: 'Focus Time',
        };
      case TimerMode.SHORT_BREAK:
        return {
          primary: 'stroke-emerald-500',
          secondary: 'stroke-emerald-500/20',
          glow: 'drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]',
          textColor: 'text-emerald-500',
          label: 'Short Break',
        };
      case TimerMode.LONG_BREAK:
        return {
          primary: 'stroke-blue-500',
          secondary: 'stroke-blue-500/20',
          glow: 'drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]',
          textColor: 'text-blue-500',
          label: 'Long Break',
        };
    }
  };

  const colors = getModeColors();
  const isRunning = status === TimerStatus.RUNNING;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Timer Circle Container */}
      <div
        className={`relative transition-transform duration-500 ${isRunning ? 'animate-[pulse-ring_2s_ease-in-out_infinite]' : ''}`}
        style={{ width: size, height: size }}
      >
        {/* SVG Timer Ring */}
        <svg
          className={`transform -rotate-90 transition-all duration-300 ${isRunning ? colors.glow : ''}`}
          width={size}
          height={size}
        >
          {/* Background circle (track) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={`${colors.secondary} transition-colors duration-500`}
          />

          {/* Progress circle (animated) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colors.primary} transition-all duration-1000 ease-linear`}
            style={{
              filter: isRunning ? 'drop-shadow(0 0 8px currentColor)' : 'none',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Mode label */}
          <span className={`text-sm font-medium ${colors.textColor} mb-2 tracking-wide uppercase transition-all duration-300`}>
            {colors.label}
          </span>

          {/* Time display */}
          <span className="text-6xl md:text-7xl font-mono font-bold text-gray-100 dark:text-white tabular-nums tracking-tight transition-all duration-300">
            {formattedTime}
          </span>

          {/* Status indicator */}
          <div className="mt-3 flex items-center gap-2">
            {isRunning && (
              <span className={`inline-block w-2 h-2 rounded-full ${colors.textColor.replace('text-', 'bg-')} animate-pulse shadow-lg`} />
            )}
            <span className="text-sm text-gray-400 transition-opacity duration-300">
              {status === TimerStatus.RUNNING && 'Running'}
              {status === TimerStatus.PAUSED && 'Paused'}
              {status === TimerStatus.IDLE && 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerDisplay;
