// src/hooks/useWakeLock.ts
// Wake Lock API hook - keeps the screen on during active timer sessions
// Uses the Screen Wake Lock API: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

import { useState, useCallback, useRef, useEffect } from 'react';

interface WakeLockState {
  /** Whether the wake lock is currently active */
  isActive: boolean;
  /** Whether the Wake Lock API is supported in this browser */
  isSupported: boolean;
  /** Any error that occurred while acquiring/releasing the lock */
  error: Error | null;
}

interface UseWakeLockReturn extends WakeLockState {
  /** Request the wake lock - keeps screen on */
  request: () => Promise<void>;
  /** Release the wake lock - allows screen to sleep */
  release: () => Promise<void>;
}

/**
 * Hook to manage screen wake lock during timer sessions.
 *
 * The Wake Lock API prevents the device screen from dimming or locking
 * while the user is actively using the timer. This is crucial for a
 * Pomodoro app where users need to see the timer at a glance.
 *
 * Key behaviors:
 * - Automatically releases when tab becomes hidden (browser requirement)
 * - Can be re-acquired when tab becomes visible again
 * - Gracefully handles unsupported browsers
 * - Cleans up on unmount
 */
export function useWakeLock(): UseWakeLockReturn {
  const [state, setState] = useState<WakeLockState>({
    isActive: false,
    isSupported: typeof navigator !== 'undefined' && 'wakeLock' in navigator,
    error: null,
  });

  // Store the actual WakeLockSentinel reference
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Track if we should re-acquire on visibility change
  const shouldReacquireRef = useRef(false);

  /**
   * Request a wake lock. Idempotent - safe to call multiple times.
   */
  const request = useCallback(async () => {
    // Check API support
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: new Error('Wake Lock API not supported in this browser'),
      }));
      return;
    }

    // Already have an active lock
    if (wakeLockRef.current) {
      return;
    }

    try {
      // Request the wake lock
      // TypeScript note: navigator.wakeLock is typed correctly in lib.dom.d.ts
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      shouldReacquireRef.current = true;

      setState((prev) => ({
        ...prev,
        isActive: true,
        error: null,
      }));

      // Listen for release events (e.g., when tab becomes hidden)
      sentinel.addEventListener('release', () => {
        wakeLockRef.current = null;
        setState((prev) => ({
          ...prev,
          isActive: false,
        }));
      });
    } catch (err) {
      // Handle errors gracefully
      // Common errors:
      // - NotAllowedError: document not fully active or visible
      // - AbortError: system denied the request
      const error = err instanceof Error ? err : new Error('Failed to acquire wake lock');
      setState((prev) => ({
        ...prev,
        isActive: false,
        error,
      }));
    }
  }, [state.isSupported]);

  /**
   * Release the wake lock. Idempotent - safe to call even if not active.
   */
  const release = useCallback(async () => {
    shouldReacquireRef.current = false;

    if (!wakeLockRef.current) {
      return;
    }

    try {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setState((prev) => ({
        ...prev,
        isActive: false,
        error: null,
      }));
    } catch (err) {
      // Release errors are rare but can happen
      const error = err instanceof Error ? err : new Error('Failed to release wake lock');
      setState((prev) => ({
        ...prev,
        error,
      }));
    }
  }, []);

  /**
   * Handle visibility changes - re-acquire wake lock when tab becomes visible
   * if we had one before.
   *
   * The Wake Lock API automatically releases when the tab is hidden.
   * We need to re-acquire when it becomes visible again.
   */
  useEffect(() => {
    if (!state.isSupported) {
      return;
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldReacquireRef.current) {
        // Tab is visible again and we want a wake lock - re-acquire
        await request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isSupported, request]);

  /**
   * Clean up on unmount - release any active wake lock
   */
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {
          // Ignore errors on cleanup
        });
      }
    };
  }, []);

  return {
    ...state,
    request,
    release,
  };
}

export type { WakeLockState, UseWakeLockReturn };
