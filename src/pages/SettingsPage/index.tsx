import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { TimerSettings } from './components/TimerSettings';
import { NotificationSettings } from './components/NotificationSettings';
import { ThemeSettings } from './components/ThemeSettings';
import { useStore } from '../../store';
import { Modal } from '../../components/ui/Modal';

export function SettingsPage() {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const tasks = useStore((state) => state.tasks);
  const sessions = useStore((state) => state.sessions);

  const handleClearAllData = () => {
    // Clear localStorage
    localStorage.removeItem('brain-wrangler-storage');
    // Reload to reset state
    window.location.reload();
  };

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      <TimerSettings />
      <NotificationSettings />
      <ThemeSettings />

      {/* Data Management */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Data</h3>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <span>Tasks: {tasks.length}</span>
            <span>Sessions: {sessions.length}</span>
          </div>

          {/* Clear Data Button */}
          <button
            onClick={() => setShowClearDialog(true)}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              bg-red-500/10 hover:bg-red-500/20 border border-red-500/30
              text-red-400 hover:text-red-300 font-medium
              transition-colors duration-200
            "
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>

          <p className="mt-2 text-xs text-gray-500 text-center">
            This will delete all tasks, sessions, and reset settings.
          </p>
        </div>
      </section>

      {/* App Info */}
      <section className="text-center text-gray-500 text-xs">
        <p>Brain Wrangler v1.0.0</p>
        <p className="mt-1">Built by the Pied Piper Team</p>
      </section>

      {/* Confirm Clear Dialog */}
      <Modal
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        title="Clear All Data?"
      >
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            This will permanently delete all your tasks, pomodoro history, and reset all settings.
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowClearDialog(false)}
              className="
                flex-1 px-4 py-3 rounded-lg font-medium
                bg-gray-700 hover:bg-gray-600 text-white
                transition-colors
              "
            >
              Cancel
            </button>
            <button
              onClick={handleClearAllData}
              className="
                flex-1 px-4 py-3 rounded-lg font-medium
                bg-red-600 hover:bg-red-700 text-white
                transition-colors
              "
            >
              Delete Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SettingsPage;
