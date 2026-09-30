import { Task } from '../types/todo';

export interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
}

/**
 * Check if browser notifications are supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

/**
 * Send a browser push notification for a task reminder
 */
export function sendPushNotification(title: string, options?: NotificationOptions) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'taskflow-reminder',
      ...options,
    } as NotificationOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (e) {
    console.warn('Push notification delivery failed:', e);
    return null;
  }
}

/**
 * Send push notification for a specific task reminder
 */
export function sendTaskReminderNotification(task: Task) {
  const timeText = task.dueTime ? `at ${task.dueTime}` : 'due now';
  return sendPushNotification(`Reminder: ${task.title}`, {
    body: task.description ? `${task.description} (${timeText})` : `Your scheduled task is ${timeText}.`,
  });
}
