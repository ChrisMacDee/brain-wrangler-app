import { useStore } from '../../../store';
import { Slider } from '../../../components/ui/Slider';
import { Toggle } from '../../../components/ui/Toggle';

/**
 * Timer Settings Section
 *
 * Allows users to configure:
 * - Work session duration (1-60 minutes)
 * - Short break duration (1-60 minutes)
 * - Long break duration (1-60 minutes)
 * - Long break interval (2-10 pomodoros)
 * - Auto-start breaks after work
 * - Auto-start work after breaks
 */
export function TimerSettings() {
  const settings = useStore((state) => state.settings.timer);
  const updateTimerSettings = useStore((state) => state.updateTimerSettings);

  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Timer Settings</h3>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-6">
        {/* Duration Sliders */}
        <div className="space-y-5">
          <Slider
            label="Work Duration"
            value={settings.workDuration}
            onChange={(value) => updateTimerSettings({ workDuration: value })}
            min={1}
            max={60}
            unit="min"
          />

          <Slider
            label="Short Break Duration"
            value={settings.shortBreakDuration}
            onChange={(value) => updateTimerSettings({ shortBreakDuration: value })}
            min={1}
            max={60}
            unit="min"
          />

          <Slider
            label="Long Break Duration"
            value={settings.longBreakDuration}
            onChange={(value) => updateTimerSettings({ longBreakDuration: value })}
            min={1}
            max={60}
            unit="min"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700" />

        {/* Long Break Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Long Break Interval
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                min={2}
                max={10}
                value={settings.longBreakInterval}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(2, Number(e.target.value) || 2));
                  updateTimerSettings({ longBreakInterval: value });
                }}
                className="
                  w-20 px-3 py-2 rounded-lg text-center text-white font-semibold
                  bg-gray-700 border border-gray-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                "
              />
            </div>
            <span className="text-sm text-gray-400">
              pomodoros before a long break
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            After completing this many work sessions, you will get a long break instead of a short one.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700" />

        {/* Auto-start Toggles */}
        <div className="space-y-4">
          <Toggle
            label="Auto-start breaks"
            description="Automatically start break timer after completing a work session"
            checked={settings.autoStartBreaks}
            onChange={(checked) => updateTimerSettings({ autoStartBreaks: checked })}
          />

          <Toggle
            label="Auto-start work after break"
            description="Automatically start work timer after a break ends"
            checked={settings.autoStartWork}
            onChange={(checked) => updateTimerSettings({ autoStartWork: checked })}
          />
        </div>
      </div>
    </section>
  );
}

export default TimerSettings;
