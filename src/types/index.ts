// src/types/index.ts

// ============================================
// CORE ENUMS (as const objects for erasableSyntaxOnly)
// ============================================

export const TimerMode = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
} as const;
export type TimerMode = (typeof TimerMode)[keyof typeof TimerMode];

export const TimerStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
} as const;
export type TimerStatus = (typeof TimerStatus)[keyof typeof TimerStatus];

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// ============================================
// SETTINGS
// ============================================

export interface TimerSettings {
  workDuration: number;         // minutes (default: 25)
  shortBreakDuration: number;   // minutes (default: 5)
  longBreakDuration: number;    // minutes (default: 15)
  longBreakInterval: number;    // pomodoros before long break (default: 4)
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface AppSettings {
  timer: TimerSettings;
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'system';
}

// ============================================
// TASK MODEL
// ============================================

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedPomodoros: number;    // user's estimate
  completedPomodoros: number;    // actual count
  status: TaskStatus;
  createdAt: number;             // Unix timestamp
  completedAt: number | null;
  order: number;                 // for drag-drop ordering
}

// ============================================
// TIMER SESSION MODEL
// ============================================

export interface TimerSession {
  id: string;
  mode: TimerMode;
  taskId: string | null;         // associated task (null for unassigned)
  startedAt: number;
  completedAt: number | null;
  duration: number;              // actual duration in seconds
  wasCompleted: boolean;         // did they finish or abandon?
}

// ============================================
// TIMER STATE (Runtime only, not persisted)
// ============================================

export interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  remainingSeconds: number;
  currentTaskId: string | null;
  pomodorosInSession: number;    // count toward long break
}

// ============================================
// INSIGHTS / ANALYTICS
// ============================================

export interface DailyStats {
  date: string;                  // ISO date string (YYYY-MM-DD)
  completedPomodoros: number;
  totalWorkMinutes: number;
  tasksCompleted: number;
}

export interface TaskAccuracy {
  taskId: string;
  title: string;
  estimated: number;
  actual: number;
  accuracy: number;              // percentage (100 = perfect)
}
