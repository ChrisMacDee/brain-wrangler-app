import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store';
import { selectTimerStatus, selectPomodorosInSession, selectRemainingSeconds, selectTimerMode } from '../../store/selectors/timerSelectors';
import { TimerStatus, TaskStatus, TimerMode } from '../../types';
import { TimerDisplay, TimerControls, ModeSelector, CurrentTaskCard, TaskSelector } from './components';
import { Target, CheckCircle } from 'lucide-react';

export function TimerPage() {
  const status = useStore(selectTimerStatus);
  const remainingSeconds = useStore(selectRemainingSeconds);
  const mode = useStore(selectTimerMode);
  const tick = useStore((state) => state.tick);
  const syncTimer = useStore((state) => state.syncTimer);
  const completePomodoro = useStore((state) => state.completePomodoro);
  const pomodorosInSession = useStore(selectPomodorosInSession);
  const settings = useStore((state) => state.settings.timer);
  const notificationSettings = useStore((state) => state.settings.notifications);

  // Task assignment
  const currentTaskId = useStore((state) => state.currentTaskId);
  const tasks = useStore((state) => state.tasks);
  const assignTask = useStore((state) => state.assignTask);
  const updateTask = useStore((state) => state.updateTask);
  const getNextTask = useStore((state) => state.getNextTask);

  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const previousRemainingRef = useRef(remainingSeconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Detect timer completion
  useEffect(() => {
    const wasRunning = previousRemainingRef.current > 0;
    const isNowZero = remainingSeconds === 0;

    if (wasRunning && isNowZero && status === TimerStatus.IDLE) {
      // Timer just completed!
      handleTimerComplete();
    }

    previousRemainingRef.current = remainingSeconds;
  }, [remainingSeconds, status]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/complete.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const handleTimerComplete = () => {
    // Call the store's completion handler
    completePomodoro();

    // Visual feedback
    setShowCompletion(true);
    setTimeout(() => setShowCompletion(false), 3000);

    // Haptic feedback
    if ('vibrate' in navigator && notificationSettings.vibration) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Sound feedback
    if (notificationSettings.sound && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore errors if sound can't play
      });
    }

    // Browser notification
    if (notificationSettings.enabled && 'Notification' in window && Notification.permission === 'granted') {
      const modeLabel = mode === TimerMode.WORK ? 'Focus session' : 'Break';
      new Notification('Brain Wrangler', {
        body: `${modeLabel} complete! Great work!`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
      });
    }
  };

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
      {/* Completion Notification */}
      {showCompletion && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-[slide-up_0.3s_ease-out]">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/20">
            <CheckCircle className="w-6 h-6 animate-[celebration-shake_0.5s_ease-in-out]" />
            <div>
              <p className="font-semibold text-lg">Complete!</p>
              <p className="text-sm text-emerald-100">
                {mode === TimerMode.WORK ? 'Focus session done!' : 'Break finished!'}
              </p>
            </div>
          </div>
        </div>
      )}

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
