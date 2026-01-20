// src/hooks/useNotifications.ts
// Notifications hook - handles Web Notifications API and Vibration API
// for timer completion alerts

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TimerMode } from '../types';
import { TimerMode as TimerModeValue } from '../types';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationsState {
  /** Current permission state */
  permission: NotificationPermission;
  /** Whether the Notifications API is supported */
  isSupported: boolean;
  /** Whether vibration is supported */
  isVibrationSupported: boolean;
}

interface NotificationOptions {
  /** Play notification sound */
  sound?: boolean;
  /** Trigger vibration */
  vibration?: boolean;
}

interface UseNotificationsReturn extends NotificationsState {
  /** Request notification permission from user */
  requestPermission: () => Promise<boolean>;
  /** Show a timer completion notification */
  notifyTimerComplete: (mode: TimerMode, options?: NotificationOptions) => void;
  /** Trigger vibration pattern */
  vibrate: (pattern?: number | number[]) => void;
}

// Vibration patterns - designed for distinct feedback
const VIBRATION_PATTERNS = {
  // Work complete: strong double pulse (achievement feeling)
  work: [200, 100, 200],
  // Short break complete: gentle single pulse
  shortBreak: [150],
  // Long break complete: triple pulse (time to focus again!)
  longBreak: [100, 50, 100, 50, 100],
} as const;

/**
 * Hook for managing timer notifications and haptic feedback.
 *
 * Implements a clean abstraction over:
 * - Web Notifications API for visual alerts
 * - Vibration API for haptic feedback on mobile
 *
 * Gracefully degrades when APIs are unavailable.
 */
export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationsState>(() => ({
    permission: typeof Notification !== 'undefined'
      ? (Notification.permission as NotificationPermission)
      : 'denied',
    isSupported: typeof Notification !== 'undefined',
    isVibrationSupported: typeof navigator !== 'undefined' && 'vibrate' in navigator,
  }));

  // Track active notification for cleanup
  const activeNotificationRef = useRef<Notification | null>(null);

  /**
   * Request permission for notifications.
   * Returns true if permission was granted.
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    // Already have permission
    if (state.permission === 'granted') {
      return true;
    }

    // Already denied - can't re-ask
    if (state.permission === 'denied') {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setState((prev) => ({
        ...prev,
        permission: result as NotificationPermission,
      }));
      return result === 'granted';
    } catch {
      // Some browsers throw on permission request
      return false;
    }
  }, [state.isSupported, state.permission]);

  /**
   * Trigger device vibration with optional pattern.
   * Fails silently if not supported.
   */
  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if (!state.isVibrationSupported) {
      return;
    }

    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration failed - likely blocked or unsupported context
      // Fail silently as this is non-critical
    }
  }, [state.isVibrationSupported]);

  /**
   * Show a notification for timer completion.
   * Handles both visual notification and optional vibration.
   */
  const notifyTimerComplete = useCallback((
    mode: TimerMode,
    options: NotificationOptions = { sound: true, vibration: true }
  ) => {
    const { sound = true, vibration = true } = options;

    // Handle vibration if requested and supported
    if (vibration && state.isVibrationSupported) {
      const pattern = mode === TimerModeValue.WORK
        ? VIBRATION_PATTERNS.work
        : mode === TimerModeValue.SHORT_BREAK
          ? VIBRATION_PATTERNS.shortBreak
          : VIBRATION_PATTERNS.longBreak;
      vibrate([...pattern]);
    }

    // Don't show notification if not permitted
    if (!state.isSupported || state.permission !== 'granted') {
      return;
    }

    // Close any existing notification
    if (activeNotificationRef.current) {
      activeNotificationRef.current.close();
    }

    // Construct appropriate message based on mode
    let title: string;
    let body: string;
    let icon: string;

    if (mode === TimerModeValue.WORK) {
      title = 'Focus Session Complete!';
      body = 'Great work! Time for a break.';
      icon = '/icons/work-complete.png';
    } else if (mode === TimerModeValue.SHORT_BREAK) {
      title = 'Break Over';
      body = 'Ready to focus again?';
      icon = '/icons/break-complete.png';
    } else {
      title = 'Long Break Complete';
      body = 'Feeling refreshed? Let\'s get back to it!';
      icon = '/icons/break-complete.png';
    }

    try {
      const notification = new Notification(title, {
        body,
        icon,
        tag: 'brain-wrangler-timer', // Replaces existing notifications
        requireInteraction: false,   // Auto-dismiss after a while
        silent: !sound,              // Control sound via this flag
      });

      activeNotificationRef.current = notification;

      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle click - focus the app
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Notification construction failed
      // This can happen in certain contexts (e.g., some mobile browsers)
    }
  }, [state.isSupported, state.permission, state.isVibrationSupported, vibrate]);

  /**
   * Listen for permission changes
   * Note: Not all browsers support this, but it's a nice enhancement
   */
  useEffect(() => {
    if (!state.isSupported) {
      return;
    }

    // Check if permissions API is available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then((status) => {
        const handleChange = () => {
          setState((prev) => ({
            ...prev,
            permission: Notification.permission as NotificationPermission,
          }));
        };

        status.addEventListener('change', handleChange);

        return () => {
          status.removeEventListener('change', handleChange);
        };
      }).catch(() => {
        // Permissions API query failed - not critical
      });
    }
  }, [state.isSupported]);

  /**
   * Cleanup active notification on unmount
   */
  useEffect(() => {
    return () => {
      if (activeNotificationRef.current) {
        activeNotificationRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    requestPermission,
    notifyTimerComplete,
    vibrate,
  };
}

export type { NotificationsState, NotificationOptions, UseNotificationsReturn };
