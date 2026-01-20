import type { AppStore } from '../index';

// Timer selectors for optimized re-renders
export const selectTimerStatus = (state: AppStore) => state.status;
export const selectTimerMode = (state: AppStore) => state.mode;
export const selectRemainingSeconds = (state: AppStore) => state.remainingSeconds;
export const selectCurrentTaskId = (state: AppStore) => state.currentTaskId;
export const selectPomodorosInSession = (state: AppStore) => state.pomodorosInSession;

// Derived selector for formatted time
export const selectFormattedTime = (state: AppStore) => {
  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Derived selector for progress percentage
export const selectTimerProgress = (state: AppStore) => {
  const totalSeconds = state.mode === 'work'
    ? state.settings.timer.workDuration * 60
    : state.mode === 'shortBreak'
    ? state.settings.timer.shortBreakDuration * 60
    : state.settings.timer.longBreakDuration * 60;

  return ((totalSeconds - state.remainingSeconds) / totalSeconds) * 100;
};
