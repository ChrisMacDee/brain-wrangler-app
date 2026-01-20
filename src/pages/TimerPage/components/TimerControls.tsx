import { Play, Pause, RotateCcw } from 'lucide-react';
import { useStore } from '../../../store';
import { selectTimerStatus, selectTimerMode } from '../../../store/selectors/timerSelectors';
import { TimerStatus, TimerMode } from '../../../types';

export function TimerControls() {
  const status = useStore(selectTimerStatus);
  const mode = useStore(selectTimerMode);
  const startTimer = useStore((state) => state.startTimer);
  const pauseTimer = useStore((state) => state.pauseTimer);
  const resetTimer = useStore((state) => state.resetTimer);

  const isRunning = status === TimerStatus.RUNNING;
  const isPaused = status === TimerStatus.PAUSED;

  // Mode-based accent colors for the primary button
  const getPrimaryButtonStyles = () => {
    const baseStyles = 'min-w-[140px] min-h-[56px] px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg active:scale-95';

    if (isRunning) {
      // Pause button - amber/yellow
      return `${baseStyles} bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25`;
    }

    // Start/Resume button - color based on mode
    switch (mode) {
      case TimerMode.WORK:
        return `${baseStyles} bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25`;
      case TimerMode.SHORT_BREAK:
        return `${baseStyles} bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25`;
      case TimerMode.LONG_BREAK:
        return `${baseStyles} bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25`;
    }
  };

  const handlePrimaryClick = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const getPrimaryLabel = () => {
    if (isRunning) return 'Pause';
    if (isPaused) return 'Resume';
    return 'Start';
  };

  const getPrimaryIcon = () => {
    if (isRunning) {
      return <Pause className="w-6 h-6" strokeWidth={2.5} />;
    }
    return <Play className="w-6 h-6 ml-0.5" strokeWidth={2.5} />;
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Primary Start/Pause Button */}
      <button
        onClick={handlePrimaryClick}
        className={getPrimaryButtonStyles()}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {getPrimaryIcon()}
        <span>{getPrimaryLabel()}</span>
      </button>

      {/* Reset Button */}
      <button
        onClick={resetTimer}
        className="min-w-[56px] min-h-[56px] p-4 rounded-2xl font-medium text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 hover:text-gray-200 transition-all duration-200 flex items-center justify-center active:scale-95 border border-gray-700/50"
        aria-label="Reset timer"
      >
        <RotateCcw className="w-6 h-6" strokeWidth={2} />
      </button>
    </div>
  );
}

export default TimerControls;
