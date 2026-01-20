import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TimerSession, DailyStats, TaskAccuracy } from '../../types';
import { TimerMode } from '../../types';
import { format, isWithinInterval, subDays, startOfDay, endOfDay } from 'date-fns';

export interface SessionsSlice {
  sessions: TimerSession[];
  addSession: (session: Omit<TimerSession, 'id'>) => void;
  getSessionsByDateRange: (start: Date, end: Date) => TimerSession[];
  getDailyStats: (days: number) => DailyStats[];
  getTaskAccuracyStats: () => TaskAccuracy[];
}

export const createSessionsSlice: StateCreator<
  SessionsSlice,
  [['zustand/immer', never]],
  [],
  SessionsSlice
> = (set, get) => ({
  // Initial State
  sessions: [],

  // Actions
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
          s.mode === TimerMode.WORK &&
          isWithinInterval(new Date(s.startedAt), { start: dayStart, end: dayEnd })
      );

      const completedPomodoros = daySessions.length;
      const totalWorkMinutes = Math.round(
        daySessions.reduce((acc, s) => acc + s.duration, 0) / 60
      );

      // Count unique tasks completed (this is simplified - full implementation would track task completions)
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
    // This is a placeholder - full implementation would calculate
    // accuracy based on estimated vs actual pomodoros from tasks
    return [];
  },
});
