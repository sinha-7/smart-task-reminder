import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions.
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

/**
 * Schedule a local push notification for a task reminder.
 * @param {{ title: string, body: string, triggerDate: Date }} options
 * @returns {Promise<string>} Notification identifier
 */
export async function scheduleTaskReminder({ title, body, triggerDate }) {
  const trigger = new Date(triggerDate);
  const now = new Date();

  if (trigger <= now) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ ${title}`,
      body,
      sound: true,
    },
    trigger,
  });

  return id;
}

/**
 * Cancel a scheduled notification.
 * @param {string} notificationId
 */
export async function cancelReminder(notificationId) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
