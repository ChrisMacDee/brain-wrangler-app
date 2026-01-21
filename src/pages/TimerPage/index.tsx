import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { selectTimerStatus, selectPomodorosInSession } from '../../store/selectors/timerSelectors';
import { TimerStatus, TaskStatus } from '../../types';
import { TimerDisplay, TimerControls, ModeSelector, CurrentTaskCard, TaskSelector } from './components';
import { Target } from 'lucide-react';

export function TimerPage() {
  const status = useStore(selectTimerStatus);
  const tick = useStore((state) => state.tick);
  const syncTimer = useStore((state) => state.syncTimer);
  const pomodorosInSession = useStore(selectPomodorosInSession);
  const settings = useStore((state) => state.settings.timer);

  // Task assignment
  const currentTaskId = useStore((state) => state.currentTaskId);
  const tasks = useStore((state) => state.tasks);
  const assignTask = useStore((state) => state.assignTask);
  const updateTask = useStore((state) => state.updateTask);
  const getNextTask = useStore((state) => state.getNextTask);

  const [showTaskSelector, setShowTaskSelector] = useState(false);

  const currentTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) || null : null;

  // Sync timer when page becomes visible (handles background/foreground transitions)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && status === TimerStatus.RUNNING) {
        syncTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status, syncTimer]);

  // Timer tick effect - runs every second when timer is active
  useEffect(() => {
    let intervalId: number | undefined;

    if (status === TimerStatus.RUNNING) {
      intervalId = window.setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [status, tick]);

  const handleSelectTask = (taskId: string) => {
    assignTask(taskId);
  };

  const handleCompleteTask = () => {
    if (currentTaskId) {
      // Mark task as completed
      updateTask(currentTaskId, {
        status: TaskStatus.COMPLETED,
        completedAt: Date.now(),
      });

      // Auto-assign next available task
      const nextTask = getNextTask();
      if (nextTask && nextTask.id !== currentTaskId) {
        assignTask(nextTask.id);
      } else {
        assignTask(null);
      }
    }
  };

  const handleClearTask = () => {
    assignTask(null);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full px-3 py-3 md:px-4 md:py-8">
      {/* Top Section - Mode Selector */}
      <div className="w-full flex justify-center">
        <ModeSelector />
      </div>

      {/* Center Section - Timer Display (Hero) */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-2 md:-mt-8">
        <TimerDisplay size={260} />

        {/* Session Progress Indicator */}
        <div className="mt-4 flex items-center gap-2 text-gray-400">
          <Target className="w-4 h-4" />
          <span className="text-sm">
            {pomodorosInSession} / {settings.longBreakInterval} until long break
          </span>
        </div>

        {/* Current Task Card */}
        <div className="mt-4 w-full">
          <CurrentTaskCard
            task={currentTask}
            onSelectTask={() => setShowTaskSelector(true)}
            onCompleteTask={handleCompleteTask}
            onClearTask={handleClearTask}
          />
        </div>
      </div>

      {/* Bottom Section - Controls */}
      <div className="w-full pb-2 md:pb-8">
        <TimerControls />
      </div>

      {/* Task Selector Modal */}
      <TaskSelector
        isOpen={showTaskSelector}
        onClose={() => setShowTaskSelector(false)}
        onSelectTask={handleSelectTask}
      />
    </div>
  );
}

export default TimerPage;
