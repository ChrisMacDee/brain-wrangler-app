import type { AppStore } from '../index';
import { TimerMode } from '../../types';

// Insight/analytics selectors
export const selectAllSessions = (state: AppStore) => state.sessions;

export const selectTotalPomodoros = (state: AppStore) =>
  state.sessions.filter((s) => s.wasCompleted && s.mode === TimerMode.WORK).length;

export const selectTotalWorkMinutes = (state: AppStore) =>
  Math.round(
    state.sessions
      .filter((s) => s.wasCompleted && s.mode === TimerMode.WORK)
      .reduce((acc, s) => acc + s.duration, 0) / 60
  );

export const selectTodayPomodoros = (state: AppStore) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  return state.sessions.filter(
    (s) =>
      s.wasCompleted &&
      s.mode === TimerMode.WORK &&
      s.startedAt >= startOfDay &&
      s.startedAt < endOfDay
  ).length;
};

export const selectWeeklyStats = (state: AppStore) => {
  return state.getDailyStats(7);
};
