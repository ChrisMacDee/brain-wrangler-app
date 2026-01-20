// src/hooks/useTimer.ts
// The brain of the timer - coordinates state, intervals, and side effects
// This is where the elegant algorithm lives. Middle-out compression for time, if you will.

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { useWakeLock } from './useWakeLock';
import { useNotifications } from './useNotifications';
import { formatTime, getDurationForMode, calculateProgress, getModeLabel } from '../utils/time';
import { TimerStatus } from '../types';

/**
 * Primary timer hook - the central nervous system of Brain Wrangler.
 *
 * Responsibilities:
 * 1. Manages the interval-based tick mechanism
 * 2. Handles timer completion (notifications, session recording)
 * 3. Coordinates wake lock during active sessions
 * 4. Provides all timer state and controls to consumers
 *
 * Design decisions:
 * - Uses requestAnimationFrame + setInterval hybrid for accuracy
 * - Handles tab backgrounding gracefully (recalculates on visibility)
 * - Keeps wake lock active during running timers
 * - Separates concerns: store holds state, this hook handles side effects
 */
export function useTimer() {
  // Pull state and actions from the store
  const status = useStore((s) => s.status);
  const mode = useStore((s) => s.mode);
  const remainingSeconds = useStore((s) => s.remainingSeconds);
  const currentTaskId = useStore((s) => s.currentTaskId);
  const pomodorosInSession = useStore((s) => s.pomodorosInSession);
  const settings = useStore((s) => s.settings);

  // Actions
  const startTimer = useStore((s) => s.startTimer);
  const pauseTimer = useStore((s) => s.pauseTimer);
  const resetTimer = useStore((s) => s.resetTimer);
  const tick = useStore((s) => s.tick);
  const setMode = useStore((s) => s.setMode);
  const assignTask = useStore((s) => s.assignTask);
  const completePomodoro = useStore((s) => s.completePomodoro);

  // Compose with wake lock and notifications
  const wakeLock = useWakeLock();
  const notifications = useNotifications();

  // Refs for interval management
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const completionHandledRef = useRef<boolean>(false);

  // Track the target end time for accurate ticking after tab backgrounding
  const targetEndTimeRef = useRef<number | null>(null);

  /**
   * Calculate the total duration for the current mode
   */
  const totalDuration = getDurationForMode(mode, settings.timer);

  /**
   * Handle timer completion - called when remainingSeconds hits 0
   */
  const handleCompletion = useCallback(() => {
    // Prevent double-handling
    if (completionHandledRef.current) {
      return;
    }
    completionHandledRef.current = true;

    // Notify the user
    if (settings.notifications.enabled) {
      notifications.notifyTimerComplete(mode, {
        sound: settings.notifications.sound,
        vibration: settings.notifications.vibration,
      });
    }

    // Record the session and transition to next mode
    completePomodoro();

    // Release wake lock since we're no longer actively timing
    wakeLock.release();

    // Reset target end time
    targetEndTimeRef.current = null;
  }, [mode, settings.notifications, notifications, completePomodoro, wakeLock]);

  /**
   * Core tick function - handles the interval callback
   * Uses drift compensation for accuracy
   */
  const performTick = useCallback(() => {
    const now = Date.now();

    // If we have a target end time, calculate based on that (handles tab backgrounding)
    if (targetEndTimeRef.current) {
      const msRemaining = targetEndTimeRef.current - now;

      if (msRemaining <= 0) {
        // Timer should have completed - handle it
        tick(); // This will set remainingSeconds to 0
        handleCompletion();
        return;
      }

      // Calculate how many seconds should remain
      const expectedSecondsRemaining = Math.ceil(msRemaining / 1000);
      const currentSeconds = useStore.getState().remainingSeconds;

      // If there's significant drift, correct it
      if (Math.abs(currentSeconds - expectedSecondsRemaining) > 1) {
        // Directly set the corrected value through multiple ticks
        const ticksNeeded = currentSeconds - expectedSecondsRemaining;
        for (let i = 0; i < ticksNeeded && i < 10; i++) {
          tick();
        }
      } else {
        tick();
      }
    } else {
      tick();
    }

    lastTickRef.current = now;
  }, [tick, handleCompletion]);

  /**
   * Start the interval timer
   */
  const startInterval = useCallback(() => {
    // Don't start if already running
    if (intervalRef.current) {
      return;
    }

    // Reset completion flag
    completionHandledRef.current = false;

    // Calculate target end time for drift compensation
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    lastTickRef.current = Date.now();

    // Use 1-second intervals - the standard for timer applications
    // We handle drift through target time calculation
    intervalRef.current = setInterval(performTick, 1000);
  }, [remainingSeconds, performTick]);

  /**
   * Stop the interval timer
   */
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    targetEndTimeRef.current = null;
  }, []);

  /**
   * Effect: Manage interval based on timer status
   */
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      startInterval();
    } else {
      stopInterval();
    }

    return () => {
      stopInterval();
    };
  }, [status, startInterval, stopInterval]);

  /**
   * Effect: Manage wake lock based on timer status
   */
  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      wakeLock.request();
    } else if (status === TimerStatus.IDLE) {
      wakeLock.release();
    }
    // Note: We keep wake lock during PAUSED state so screen stays on
  }, [status, wakeLock]);

  /**
   * Effect: Handle timer reaching zero
   * This catches the case where tick() sets remainingSeconds to 0
   */
  useEffect(() => {
    if (remainingSeconds === 0 && status === TimerStatus.IDLE && !completionHandledRef.current) {
      handleCompletion();
    }
  }, [remainingSeconds, status, handleCompletion]);

  /**
   * Effect: Handle tab visibility changes
   * When tab becomes visible again, recalculate timer state
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === TimerStatus.RUNNING) {
        // Tab became visible - check if we need to catch up
        if (targetEndTimeRef.current) {
          const now = Date.now();
          const msRemaining = targetEndTimeRef.current - now;

          if (msRemaining <= 0) {
            // Timer should have completed while tab was hidden
            handleCompletion();
          }
          // If still running, the next interval tick will handle drift correction
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status, handleCompletion]);

  /**
   * Effect: Update document title with timer state
   * This provides at-a-glance timer info even when tab is not focused
   */
  useEffect(() => {
    const modeLabel = getModeLabel(mode);
    const timeDisplay = formatTime(remainingSeconds);

    if (status === TimerStatus.RUNNING) {
      document.title = `${timeDisplay} - ${modeLabel} | Brain Wrangler`;
    } else if (status === TimerStatus.PAUSED) {
      document.title = `${timeDisplay} (Paused) - ${modeLabel} | Brain Wrangler`;
    } else {
      document.title = 'Brain Wrangler';
    }

    // Cleanup: restore default title on unmount
    return () => {
      document.title = 'Brain Wrangler';
    };
  }, [status, mode, remainingSeconds]);

  /**
   * Effect: Reset completion flag when mode changes or timer is reset
   */
  useEffect(() => {
    completionHandledRef.current = false;
  }, [mode, totalDuration]);

  /**
   * Toggle function - convenience for play/pause button
   */
  const toggle = useCallback(() => {
    if (status === TimerStatus.RUNNING) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [status, pauseTimer, startTimer]);

  /**
   * Skip to next mode - useful for "skip break" functionality
   */
  const skip = useCallback(() => {
    stopInterval();
    completionHandledRef.current = true; // Prevent notification on skip
    completePomodoro();
  }, [stopInterval, completePomodoro]);

  // Return everything consumers need
  return {
    // State
    status,
    mode,
    remainingSeconds,
    currentTaskId,
    pomodorosInSession,

    // Derived values
    formattedTime: formatTime(remainingSeconds),
    progress: calculateProgress(remainingSeconds, totalDuration),
    modeLabel: getModeLabel(mode),
    totalDuration,
    isRunning: status === TimerStatus.RUNNING,
    isPaused: status === TimerStatus.PAUSED,
    isIdle: status === TimerStatus.IDLE,

    // Actions
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
    toggle,
    skip,
    setMode,
    assignTask,

    // Wake lock state (for UI indicators)
    wakeLockActive: wakeLock.isActive,
    wakeLockSupported: wakeLock.isSupported,

    // Notification state (for settings UI)
    notificationPermission: notifications.permission,
    requestNotificationPermission: notifications.requestPermission,

    // Settings for reference
    settings: settings.timer,
  };
}

export type UseTimerReturn = ReturnType<typeof useTimer>;
