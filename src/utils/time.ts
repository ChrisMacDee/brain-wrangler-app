// src/utils/time.ts
// Time utilities - optimized for minimal overhead and maximum clarity

import type { TimerMode, TimerSettings } from '../types';
import { TimerMode as TimerModeValue } from '../types';

/**
 * Formats seconds into MM:SS display format.
 * Uses mathematical operations instead of Date objects for efficiency.
 *
 * @param seconds - Total seconds to format
 * @returns Formatted string in MM:SS format
 */
export function formatTime(seconds: number): string {
  // Handle edge cases - negative or NaN should display as 00:00
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Pad with zeros - this is faster than padStart for simple cases
  const minStr = mins < 10 ? `0${mins}` : `${mins}`;
  const secStr = secs < 10 ? `0${secs}` : `${secs}`;

  return `${minStr}:${secStr}`;
}

/**
 * Gets the duration in seconds for a given timer mode based on settings.
 * Central source of truth for timer durations.
 *
 * @param mode - The timer mode (work, shortBreak, longBreak)
 * @param settings - Timer settings containing duration values
 * @returns Duration in seconds
 */
export function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case TimerModeValue.WORK:
      return settings.workDuration * 60;
    case TimerModeValue.SHORT_BREAK:
      return settings.shortBreakDuration * 60;
    case TimerModeValue.LONG_BREAK:
      return settings.longBreakDuration * 60;
    default:
      // TypeScript exhaustive check - this should never happen
      return settings.workDuration * 60;
  }
}

/**
 * Calculates the progress percentage of the timer.
 *
 * @param remainingSeconds - Seconds remaining
 * @param totalSeconds - Total seconds for this timer
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(remainingSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const elapsed = totalSeconds - remainingSeconds;
  return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
}

/**
 * Determines the next timer mode after completion.
 * Implements the Pomodoro Technique logic:
 * - After work: short break (or long break after N pomodoros)
 * - After any break: back to work
 *
 * @param currentMode - Current timer mode
 * @param pomodorosCompleted - Number of work sessions completed in this cycle
 * @param longBreakInterval - How many pomodoros before a long break
 * @returns The next timer mode
 */
export function getNextMode(
  currentMode: TimerMode,
  pomodorosCompleted: number,
  longBreakInterval: number
): TimerMode {
  if (currentMode === TimerModeValue.WORK) {
    // Check if we've hit the long break interval
    // pomodorosCompleted should include the one just finished
    if (pomodorosCompleted > 0 && pomodorosCompleted % longBreakInterval === 0) {
      return TimerModeValue.LONG_BREAK;
    }
    return TimerModeValue.SHORT_BREAK;
  }

  // After any break, return to work
  return TimerModeValue.WORK;
}

/**
 * Formats a duration in minutes to a human-readable string.
 *
 * @param minutes - Duration in minutes
 * @returns Human-readable duration (e.g., "1h 25m" or "45m")
 */
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Gets an appropriate label for the current mode.
 *
 * @param mode - Timer mode
 * @returns Human-readable label
 */
export function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case TimerModeValue.WORK:
      return 'Focus';
    case TimerModeValue.SHORT_BREAK:
      return 'Short Break';
    case TimerModeValue.LONG_BREAK:
      return 'Long Break';
    default:
      return 'Timer';
  }
}
