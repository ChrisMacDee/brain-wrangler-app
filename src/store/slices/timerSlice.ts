import type { StateCreator } from 'zustand';
import { TimerMode, TimerStatus } from '../../types';

export interface TimerSlice {
  // State
  status: TimerStatus;
  mode: TimerMode;
  remainingSeconds: number;
  currentTaskId: string | null;
  pomodorosInSession: number;
  startTime: number | null; // Timestamp when timer started/resumed
  totalDuration: number; // Total duration of current timer session

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  assignTask: (taskId: string | null) => void;
  completePomodoro: () => void;
  syncTimer: () => void; // Sync timer based on elapsed time
}

const DEFAULT_WORK_DURATION = 25 * 60; // 25 minutes in seconds

export const createTimerSlice: StateCreator<
  TimerSlice,
  [['zustand/immer', never]],
  [],
  TimerSlice
> = (set) => ({
  // Initial State
  status: TimerStatus.IDLE,
  mode: TimerMode.WORK,
  remainingSeconds: DEFAULT_WORK_DURATION,
  currentTaskId: null,
  pomodorosInSession: 0,
  startTime: null,
  totalDuration: DEFAULT_WORK_DURATION,

  // Actions
  startTimer: () =>
    set((state) => {
      state.status = TimerStatus.RUNNING;
      state.startTime = Date.now();
      state.totalDuration = state.remainingSeconds;
    }),

  pauseTimer: () =>
    set((state) => {
      // Sync timer before pausing to get accurate remaining time
      if (state.startTime && state.status === TimerStatus.RUNNING) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        state.remainingSeconds = Math.max(0, state.totalDuration - elapsed);
      }
      state.status = TimerStatus.PAUSED;
      state.startTime = null;
    }),

  resetTimer: () =>
    set((state) => {
      state.status = TimerStatus.IDLE;
      state.startTime = null;
      // Reset to the appropriate duration based on mode
      // This is a simplified version - full implementation would use settings
      let duration: number;
      switch (state.mode) {
        case TimerMode.WORK:
          duration = DEFAULT_WORK_DURATION;
          break;
        case TimerMode.SHORT_BREAK:
          duration = 5 * 60;
          break;
        case TimerMode.LONG_BREAK:
          duration = 15 * 60;
          break;
      }
      state.remainingSeconds = duration;
      state.totalDuration = duration;
    }),

  tick: () =>
    set((state) => {
      // Calculate remaining time based on elapsed time since start
      if (state.status === TimerStatus.RUNNING && state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        state.remainingSeconds = Math.max(0, state.totalDuration - elapsed);
      }
    }),

  syncTimer: () =>
    set((state) => {
      // Sync timer when app comes back to foreground
      if (state.status === TimerStatus.RUNNING && state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        state.remainingSeconds = Math.max(0, state.totalDuration - elapsed);
      }
    }),

  setMode: (mode) =>
    set((state) => {
      state.mode = mode;
      state.status = TimerStatus.IDLE;
      state.startTime = null;
      // Set duration based on mode
      let duration: number;
      switch (mode) {
        case TimerMode.WORK:
          duration = DEFAULT_WORK_DURATION;
          break;
        case TimerMode.SHORT_BREAK:
          duration = 5 * 60;
          break;
        case TimerMode.LONG_BREAK:
          duration = 15 * 60;
          break;
      }
      state.remainingSeconds = duration;
      state.totalDuration = duration;
    }),

  assignTask: (taskId) =>
    set((state) => {
      state.currentTaskId = taskId;
    }),

  completePomodoro: () =>
    set((state) => {
      if (state.mode === TimerMode.WORK) {
        state.pomodorosInSession += 1;
      }
      state.status = TimerStatus.IDLE;
      state.startTime = null;
    }),
});
