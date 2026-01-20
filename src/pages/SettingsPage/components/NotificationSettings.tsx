import { Bell, Volume2, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../../../store';
import { useNotifications } from '../../../hooks/useNotifications';
import { Toggle } from '../../../components/ui/Toggle';

/**
 * Notification Settings Section
 *
 * Allows users to configure:
 * - Enable/disable notifications (with permission request)
 * - Sound notifications
 * - Vibration feedback (on supported devices)
 *
 * Shows clear status indicators for notification permission state.
 */
export function NotificationSettings() {
  const settings = useStore((state) => state.settings.notifications);
  const updateNotificationSettings = useStore((state) => state.updateNotificationSettings);
  const { permission, isSupported, isVibrationSupported, requestPermission } = useNotifications();

  const handleEnableToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      // Need to request permission first
      const granted = await requestPermission();
      if (granted) {
        updateNotificationSettings({ enabled: true });
      }
      // If not granted, don't enable
    } else {
      updateNotificationSettings({ enabled });
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
        text: 'Notifications not supported in this browser',
        color: 'text-amber-500',
      };
    }

    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
          text: 'Notifications enabled',
          color: 'text-emerald-500',
        };
      case 'denied':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
          text: 'Notifications blocked - enable in browser settings',
          color: 'text-rose-500',
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
          text: 'Permission required',
          color: 'text-amber-500',
        };
    }
  };

  const permissionStatus = getPermissionStatus();
  const canEnableNotifications = isSupported && permission !== 'denied';
  const needsPermission = isSupported && permission === 'default';

  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4">
        {/* Permission Status Banner */}
        <div className={`flex items-center gap-2 text-sm ${permissionStatus.color}`}>
          {permissionStatus.icon}
          <span>{permissionStatus.text}</span>
        </div>

        {/* Request Permission Button (if needed) */}
        {needsPermission && (
          <button
            onClick={requestPermission}
            className="
              w-full px-4 py-2 rounded-lg font-medium text-sm
              bg-indigo-600 hover:bg-indigo-700 text-white
              transition-colors duration-200
              flex items-center justify-center gap-2
            "
          >
            <Bell className="w-4 h-4" />
            Allow Notifications
          </button>
        )}

        {/* Divider */}
        {(needsPermission || !canEnableNotifications) && (
          <div className="border-t border-gray-700" />
        )}

        {/* Notification Toggles */}
        <div className="space-y-4">
          {/* Enable Notifications Toggle */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-gray-700/50">
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <Toggle
                label="Enable notifications"
                description="Show a notification when timer sessions complete"
                checked={settings.enabled && permission === 'granted'}
                onChange={handleEnableToggle}
                disabled={!canEnableNotifications}
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-gray-700/50">
              <Volume2 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <Toggle
                label="Sound"
                description="Play a sound when notifications appear"
                checked={settings.sound}
                onChange={(checked) => updateNotificationSettings({ sound: checked })}
                disabled={!settings.enabled || permission !== 'granted'}
              />
            </div>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-gray-700/50">
              <Smartphone className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <Toggle
                label="Vibration"
                description={
                  isVibrationSupported
                    ? 'Vibrate device when sessions complete (mobile)'
                    : 'Vibration not supported on this device'
                }
                checked={settings.vibration && isVibrationSupported}
                onChange={(checked) => updateNotificationSettings({ vibration: checked })}
                disabled={!settings.enabled || !isVibrationSupported}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotificationSettings;
