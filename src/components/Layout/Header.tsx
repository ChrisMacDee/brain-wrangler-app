import { useStore } from '../../store';
import { TimerMode } from '../../types';

const modeLabels: Record<TimerMode, string> = {
  [TimerMode.WORK]: 'Focus Time',
  [TimerMode.SHORT_BREAK]: 'Short Break',
  [TimerMode.LONG_BREAK]: 'Long Break',
};

export function Header() {
  const mode = useStore((state) => state.mode);

  return (
    <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-center">
      <h1 className="text-lg font-semibold">{modeLabels[mode]}</h1>
    </header>
  );
}
