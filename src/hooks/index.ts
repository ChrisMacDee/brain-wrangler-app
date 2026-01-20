// src/hooks/index.ts
// Barrel export for hooks

export { useTimer } from './useTimer';
export type { UseTimerReturn } from './useTimer';

export { useWakeLock } from './useWakeLock';
export type { WakeLockState, UseWakeLockReturn } from './useWakeLock';

export { useNotifications } from './useNotifications';
export type { NotificationsState, NotificationOptions, UseNotificationsReturn } from './useNotifications';
