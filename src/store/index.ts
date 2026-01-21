import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { format, isWithinInterval, subDays, startOfDay, endOfDay } from 'date-fns';
import type {
  Task,
  TimerSession,
  DailyStats,
  TaskAccuracy,
  AppSettings,
  TimerSettings,
  NotificationSettings,
  TimerMode,
  TimerStatus,
} from '../types';
import {
  TimerMode as TimerModeValue,
  TimerStatus as TimerStatusValue,
  TaskStatus,
} from '../types';
import { getDurationForMode } from '../utils/time';

// ============================================
// STORE INTERFACE
// ============================================

interface AppStore {
  // Timer State
  status: TimerStatus;
  mode: TimerMode;
  remainingSeconds: number;
  currentTaskId: string | null;
  pomodorosInSession: number;
  startTime: number | null;
  totalDuration: number;

  // Timer Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  assignTask: (taskId: string | null) => void;
  completePomodoro: () => void;
  syncTimer: () => void;

  // Tasks State
  tasks: Task[];

  // Tasks Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'status' | 'completedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  incrementTaskPomodoro: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  getNextTask: () => Task | null;

  // Settings State
  settings: AppSettings;

  // Settings Actions
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setTheme: (theme: AppSettings['theme']) => void;

  // Sessions State
  sessions: TimerSession[];

  // Sessions Actions
  addSession: (session: Omit<TimerSession, 'id'>) => void;
  getSessionsByDateRange: (start: Date, end: Date) => TimerSession[];
  getDailyStats: (days: number) => DailyStats[];
  getTaskAccuracyStats: () => TaskAccuracy[];
}

const DEFAULT_WORK_DURATION = 25 * 60;

const defaultSettings: AppSettings = {
  timer: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
  },
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  theme: 'system',
};

export const useStore = create<AppStore>()(
  persist(
    immer((set, get) => ({
      // ============================================
      // TIMER SLICE
      // ============================================
      status: TimerStatusValue.IDLE,
      mode: TimerModeValue.WORK,
      remainingSeconds: DEFAULT_WORK_DURATION,
      currentTaskId: null,
      pomodorosInSession: 0,
      startTime: null,
      totalDuration: DEFAULT_WORK_DURATION,

      startTimer: () =>
        set((state) => {
          state.status = TimerStatusValue.RUNNING;
          state.startTime = Date.now();
          state.totalDuration = state.remainingSeconds;
        }),

      pauseTimer: () =>
        set((state) => {
          // Sync timer before pausing to get accurate remaining time
          if (state.startTime && state.status === TimerStatusValue.RUNNING) {
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            state.remainingSeconds = Math.max(0, state.totalDuration - elapsed);
          }
          state.status = TimerStatusValue.PAUSED;
          state.startTime = null;
        }),

      resetTimer: () =>
        set((state) => {
          state.status = TimerStatusValue.IDLE;
          state.startTime = null;
          let duration: number;
          switch (state.mode) {
            case TimerModeValue.WORK:
              duration = state.settings.timer.workDuration * 60;
              break;
            case TimerModeValue.SHORT_BREAK:
              duration = state.settings.timer.shortBreakDuration * 60;
              break;
            case TimerModeValue.LONG_BREAK:
              duration = state.settings.timer.longBreakDuration * 60;
              break;
          }
          state.remainingSeconds = duration;
          state.totalDuration = duration;
        }),

      tick: () =>
        set((state) => {
          if (state.status !== TimerStatusValue.RUNNING) {
            // Guard against ticks when not running
            return;
          }

          // Calculate remaining time based on elapsed time since start
          if (state.startTime) {
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            const newRemaining = Math.max(0, state.totalDuration - elapsed);

            if (newRemaining > 0) {
              state.remainingSeconds = newRemaining;
            } else {
              // Timer has reached zero
              state.remainingSeconds = 0;
              state.status = TimerStatusValue.IDLE;
              state.startTime = null;
              // Note: The actual completion logic (recording session, notifications)
              // is handled by useTimer hook which will call completePomodoro()
            }
          }
        }),

      syncTimer: () =>
        set((state) => {
          // Sync timer when app comes back to foreground
          if (state.status === TimerStatusValue.RUNNING && state.startTime) {
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            state.remainingSeconds = Math.max(0, state.totalDuration - elapsed);
          }
        }),

      setMode: (mode) =>
        set((state) => {
          state.mode = mode;
          state.status = TimerStatusValue.IDLE;
          state.startTime = null;
          let duration: number;
          switch (mode) {
            case TimerModeValue.WORK:
              duration = state.settings.timer.workDuration * 60;
              break;
            case TimerModeValue.SHORT_BREAK:
              duration = state.settings.timer.shortBreakDuration * 60;
              break;
            case TimerModeValue.LONG_BREAK:
              duration = state.settings.timer.longBreakDuration * 60;
              break;
          }
          state.remainingSeconds = duration;
          state.totalDuration = duration;
        }),

      assignTask: (taskId) =>
        set((state) => {
          state.currentTaskId = taskId;
        }),

      completePomodoro: () => {
        const currentState = get();

        // Record the completed session
        const session: Omit<TimerSession, 'id'> = {
          mode: currentState.mode,
          taskId: currentState.currentTaskId,
          startedAt: Date.now() - getDurationForMode(currentState.mode, currentState.settings.timer) * 1000,
          completedAt: Date.now(),
          duration: getDurationForMode(currentState.mode, currentState.settings.timer),
          wasCompleted: true,
        };

        set((state) => {
          // Add the session
          const newSession: TimerSession = {
            ...session,
            id: uuidv4(),
          };
          state.sessions.push(newSession);

          // If this was a work session, handle pomodoro counting
          if (state.mode === TimerModeValue.WORK) {
            state.pomodorosInSession += 1;

            // Increment task pomodoro count if a task is assigned
            if (state.currentTaskId) {
              const task = state.tasks.find((t) => t.id === state.currentTaskId);
              if (task) {
                task.completedPomodoros += 1;
                if (task.status === TaskStatus.PENDING) {
                  task.status = TaskStatus.IN_PROGRESS;
                }
              }
            }

            // Determine next mode based on pomodoro count
            const shouldTakeLongBreak =
              state.pomodorosInSession > 0 &&
              state.pomodorosInSession % state.settings.timer.longBreakInterval === 0;

            let duration: number;
            if (shouldTakeLongBreak) {
              state.mode = TimerModeValue.LONG_BREAK;
              duration = state.settings.timer.longBreakDuration * 60;
            } else {
              state.mode = TimerModeValue.SHORT_BREAK;
              duration = state.settings.timer.shortBreakDuration * 60;
            }
            state.remainingSeconds = duration;
            state.totalDuration = duration;

            // Auto-start break if setting enabled
            if (state.settings.timer.autoStartBreaks) {
              state.status = TimerStatusValue.RUNNING;
              state.startTime = Date.now();
            } else {
              state.status = TimerStatusValue.IDLE;
              state.startTime = null;
            }
          } else {
            // Coming from a break - switch back to work
            state.mode = TimerModeValue.WORK;
            const duration = state.settings.timer.workDuration * 60;
            state.remainingSeconds = duration;
            state.totalDuration = duration;

            // Reset pomodoros after long break
            if (currentState.mode === TimerModeValue.LONG_BREAK) {
              state.pomodorosInSession = 0;
            }

            // Auto-start work if setting enabled
            if (state.settings.timer.autoStartWork) {
              state.status = TimerStatusValue.RUNNING;
              state.startTime = Date.now();
            } else {
              state.status = TimerStatusValue.IDLE;
              state.startTime = null;
            }
          }
        });
      },

      // ============================================
      // TASKS SLICE
      // ============================================
      tasks: [],

      addTask: (taskData) =>
        set((state) => {
          const newTask: Task = {
            ...taskData,
            id: uuidv4(),
            createdAt: Date.now(),
            completedPomodoros: 0,
            status: TaskStatus.PENDING,
            completedAt: null,
          };
          state.tasks.push(newTask);
        }),

      updateTask: (id, updates) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updates };
          }
        }),

      deleteTask: (id) =>
        set((state) => {
          state.tasks = state.tasks.filter((t) => t.id !== id);
        }),

      completeTask: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (task) {
            task.status = TaskStatus.COMPLETED;
            task.completedAt = Date.now();
          }
        }),

      incrementTaskPomodoro: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (task) {
            task.completedPomodoros += 1;
            if (task.status === TaskStatus.PENDING) {
              task.status = TaskStatus.IN_PROGRESS;
            }
          }
        }),

      reorderTasks: (startIndex, endIndex) =>
        set((state) => {
          const [removed] = state.tasks.splice(startIndex, 1);
          state.tasks.splice(endIndex, 0, removed);
          state.tasks.forEach((task, index) => {
            task.order = index;
          });
        }),

      getNextTask: () => {
        const { tasks } = get();
        return tasks.find((t) => t.status !== TaskStatus.COMPLETED) || null;
      },

      // ============================================
      // SETTINGS SLICE
      // ============================================
      settings: defaultSettings,

      updateTimerSettings: (timerSettings) =>
        set((state) => {
          state.settings.timer = { ...state.settings.timer, ...timerSettings };
        }),

      updateNotificationSettings: (notificationSettings) =>
        set((state) => {
          state.settings.notifications = {
            ...state.settings.notifications,
            ...notificationSettings,
          };
        }),

      setTheme: (theme) =>
        set((state) => {
          state.settings.theme = theme;
        }),

      // ============================================
      // SESSIONS SLICE
      // ============================================
      sessions: [],

      addSession: (sessionData) =>
        set((state) => {
          const newSession: TimerSession = {
            ...sessionData,
            id: uuidv4(),
          };
          state.sessions.push(newSession);
        }),

      getSessionsByDateRange: (start, end) => {
        const { sessions } = get();
        return sessions.filter((session) =>
          isWithinInterval(new Date(session.startedAt), { start, end })
        );
      },

      getDailyStats: (days) => {
        const { sessions } = get();
        const stats: DailyStats[] = [];

        for (let i = 0; i < days; i++) {
          const date = subDays(new Date(), i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);

          const daySessions = sessions.filter(
            (s) =>
              s.wasCompleted &&
              s.mode === TimerModeValue.WORK &&
              isWithinInterval(new Date(s.startedAt), { start: dayStart, end: dayEnd })
          );

          const completedPomodoros = daySessions.length;
          const totalWorkMinutes = Math.round(
            daySessions.reduce((acc, s) => acc + s.duration, 0) / 60
          );

          const uniqueTaskIds = new Set(
            daySessions.map((s) => s.taskId).filter(Boolean)
          );

          stats.push({
            date: format(date, 'yyyy-MM-dd'),
            completedPomodoros,
            totalWorkMinutes,
            tasksCompleted: uniqueTaskIds.size,
          });
        }

        return stats.reverse();
      },

      getTaskAccuracyStats: () => {
        return [];
      },
    })),
    {
      name: 'brain-wrangler-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        tasks: state.tasks,
      }),
    }
  )
);

export type { AppStore };
