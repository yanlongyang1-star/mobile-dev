import { Platform } from 'react-native';
import { recordAppEvent } from './localDatabase';

const REMINDER_COOLDOWN_MS = 10 * 60 * 1000;
const lastReminderAtByZone = new Map<string, number>();

type NotificationsModule = typeof import('expo-notifications');

let notificationsPromise: Promise<NotificationsModule> | null = null;
let notificationHandlerReady = false;

async function getNotifications() {
  if (Platform.OS === 'web') return null;
  notificationsPromise ??= import('expo-notifications');
  const notifications = await notificationsPromise;

  if (!notificationHandlerReady) {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerReady = true;
  }

  return notifications;
}

export async function requestNotificationAccess() {
  const notifications = await getNotifications();
  if (!notifications) {
    await recordAppEvent('notification_permission_web_skipped', { granted: false });
    return false;
  }

  const current = await notifications.getPermissionsAsync();
  const finalStatus =
    current.status === 'granted' ? current : await notifications.requestPermissionsAsync();

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync('handover-reminders', {
      name: 'Handover reminders',
      importance: notifications.AndroidImportance.DEFAULT,
    });
  }

  const granted = finalStatus.status === 'granted';
  await recordAppEvent('notification_permission', { granted });
  return granted;
}

export async function scheduleHandoverReminder(zoneName: string) {
  const notifications = await getNotifications();
  if (!notifications) {
    await recordAppEvent('notification_scheduled_web_skipped', { zoneName });
    return { ok: false, reason: 'Notifications require an iOS or Android build.' };
  }

  const granted = await requestNotificationAccess();
  if (!granted) return { ok: false, reason: 'Notifications are not enabled.' };

  const now = Date.now();
  const lastReminderAt = lastReminderAtByZone.get(zoneName);
  if (lastReminderAt && now - lastReminderAt < REMINDER_COOLDOWN_MS) {
    return { ok: true, skipped: true as const, reason: 'A reminder was already scheduled recently.' };
  }

  const scheduled = await notifications.getAllScheduledNotificationsAsync();
  const zoneReminderAlreadyPending = scheduled.some((notification) => notification.content.data?.zoneName === zoneName);
  if (zoneReminderAlreadyPending) {
    return { ok: true, skipped: true as const, reason: 'A reminder for this handover zone is already pending.' };
  }

  const id = await notifications.scheduleNotificationAsync({
    content: {
      title: 'UniLease handover reminder',
      body: `Meet at ${zoneName}. Check the item condition before confirming pickup.`,
      data: { zoneName },
    },
    trigger: {
      seconds: 5,
      channelId: 'handover-reminders',
    },
  });

  lastReminderAtByZone.set(zoneName, now);
  await recordAppEvent('notification_scheduled', { id, zoneName });
  return { ok: true, id };
}
