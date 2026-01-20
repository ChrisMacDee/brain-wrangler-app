import { Sun, Moon, Monitor } from 'lucide-react';
import { useStore } from '../../../store';
import type { AppSettings } from '../../../types';

type Theme = AppSettings['theme'];

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: <Sun className="w-5 h-5" />,
    description: 'Bright and clear',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <Moon className="w-5 h-5" />,
    description: 'Easy on the eyes',
  },
  {
    value: 'system',
    label: 'System',
    icon: <Monitor className="w-5 h-5" />,
    description: 'Match device settings',
  },
];

/**
 * Theme Settings Section
 *
 * Allows users to select between:
 * - Light theme
 * - Dark theme
 * - System theme (follows OS preference)
 *
 * Uses a segmented control style for clear visual selection.
 */
export function ThemeSettings() {
  const currentTheme = useStore((state) => state.settings.theme);
  const setTheme = useStore((state) => state.setTheme);

  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Theme
        </label>

        {/* Segmented Control */}
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const isSelected = currentTheme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`
                  relative flex flex-col items-center gap-2 p-4 rounded-lg
                  border-2 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800
                  ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 hover:border-gray-500'
                  }
                `}
                aria-pressed={isSelected}
                role="radio"
                aria-checked={isSelected}
              >
                {/* Icon */}
                <div
                  className={`
                    p-2 rounded-full
                    ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-600/50 text-gray-400'}
                  `}
                >
                  {option.icon}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-sm font-medium
                    ${isSelected ? 'text-white' : 'text-gray-300'}
                  `}
                >
                  {option.label}
                </span>

                {/* Description */}
                <span
                  className={`
                    text-xs
                    ${isSelected ? 'text-indigo-300/70' : 'text-gray-500'}
                  `}
                >
                  {option.description}
                </span>

                {/* Selected indicator dot */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          The System option will automatically switch between light and dark themes based on your
          device settings.
        </p>
      </div>
    </section>
  );
}

export default ThemeSettings;
