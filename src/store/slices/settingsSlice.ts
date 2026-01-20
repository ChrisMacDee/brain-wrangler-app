import type { StateCreator } from 'zustand';
import type { AppSettings, TimerSettings, NotificationSettings } from '../../types';

export interface SettingsSlice {
  settings: AppSettings;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setTheme: (theme: AppSettings['theme']) => void;
}

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

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [['zustand/immer', never]],
  [],
  SettingsSlice
> = (set) => ({
  // Initial State
  settings: defaultSettings,

  // Actions
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
});
