import type { StateCreator } from 'zustand';
import { TimerMode, TimerStatus } from '../../types';

export interface TimerSlice {
  // State
  status: TimerStatus;
  mode: TimerMode;
  remainingSeconds: number;
  currentTaskId: string | null;
  pomodorosInSession: number;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  assignTask: (taskId: string | null) => void;
  completePomodoro: () => void;
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

  // Actions
  startTimer: () =>
    set((state) => {
      state.status = TimerStatus.RUNNING;
    }),

  pauseTimer: () =>
    set((state) => {
      state.status = TimerStatus.PAUSED;
    }),

  resetTimer: () =>
    set((state) => {
      state.status = TimerStatus.IDLE;
      // Reset to the appropriate duration based on mode
      // This is a simplified version - full implementation would use settings
      switch (state.mode) {
        case TimerMode.WORK:
          state.remainingSeconds = DEFAULT_WORK_DURATION;
          break;
        case TimerMode.SHORT_BREAK:
          state.remainingSeconds = 5 * 60;
          break;
        case TimerMode.LONG_BREAK:
          state.remainingSeconds = 15 * 60;
          break;
      }
    }),

  tick: () =>
    set((state) => {
      if (state.remainingSeconds > 0) {
        state.remainingSeconds -= 1;
      }
    }),

  setMode: (mode) =>
    set((state) => {
      state.mode = mode;
      state.status = TimerStatus.IDLE;
      // Set duration based on mode
      switch (mode) {
        case TimerMode.WORK:
          state.remainingSeconds = DEFAULT_WORK_DURATION;
          break;
        case TimerMode.SHORT_BREAK:
          state.remainingSeconds = 5 * 60;
          break;
        case TimerMode.LONG_BREAK:
          state.remainingSeconds = 15 * 60;
          break;
      }
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
    }),
});
