import { Brain, Coffee, Sunset } from 'lucide-react';
import { useStore } from '../../../store';
import { selectTimerMode } from '../../../store/selectors/timerSelectors';
import { TimerMode } from '../../../types';

interface ModeConfig {
  mode: TimerMode;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  activeBg: string;
  duration: number;
}

export function ModeSelector() {
  const currentMode = useStore(selectTimerMode);
  const setMode = useStore((state) => state.setMode);
  const settings = useStore((state) => state.settings.timer);

  const modes: ModeConfig[] = [
    {
      mode: TimerMode.WORK,
      label: 'Focus',
      icon: <Brain className="w-5 h-5" />,
      activeColor: 'text-rose-500',
      activeBg: 'bg-rose-500/10 border-rose-500/30',
      duration: settings.workDuration,
    },
    {
      mode: TimerMode.SHORT_BREAK,
      label: 'Short',
      icon: <Coffee className="w-5 h-5" />,
      activeColor: 'text-emerald-500',
      activeBg: 'bg-emerald-500/10 border-emerald-500/30',
      duration: settings.shortBreakDuration,
    },
    {
      mode: TimerMode.LONG_BREAK,
      label: 'Long',
      icon: <Sunset className="w-5 h-5" />,
      activeColor: 'text-blue-500',
      activeBg: 'bg-blue-500/10 border-blue-500/30',
      duration: settings.longBreakDuration,
    },
  ];

  const handleModeChange = (mode: TimerMode) => {
    if (mode !== currentMode) {
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
      setMode(mode);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex rounded-2xl bg-gray-800/30 p-1.5 border border-gray-700/50">
        {modes.map((modeConfig) => {
          const isActive = currentMode === modeConfig.mode;

          return (
            <button
              key={modeConfig.mode}
              onClick={() => handleModeChange(modeConfig.mode)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1
                min-h-[72px] px-3 py-3 rounded-xl
                font-medium transition-all duration-300 ease-out
                active:scale-95 transform
                ${isActive
                  ? `${modeConfig.activeBg} ${modeConfig.activeColor} border shadow-lg scale-105`
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 border border-transparent hover:scale-102'
                }
              `}
              aria-label={`Switch to ${modeConfig.label} mode`}
              aria-pressed={isActive}
            >
              {/* Icon */}
              <span className="mb-0.5">{modeConfig.icon}</span>

              {/* Label */}
              <span className="text-sm font-semibold">{modeConfig.label}</span>

              {/* Duration */}
              <span className={`text-xs ${isActive ? 'opacity-80' : 'text-gray-500'}`}>
                {modeConfig.duration} min
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ModeSelector;
