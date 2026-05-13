import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { recordAppEvent } from './localDatabase';

const REMINDER_COOLDOWN_MS = 10 * 60 * 1000;
const lastReminderAtByZone = new Map<string, number>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationAccess() {
  const current = await Notifications.getPermissionsAsync();
  const finalStatus =
    current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('handover-reminders', {
      name: 'Handover reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const granted = finalStatus.status === 'granted';
  await recordAppEvent('notification_permission', { granted });
  return granted;
}

export async function scheduleHandoverReminder(zoneName: string) {
  const granted = await requestNotificationAccess();
  if (!granted) return { ok: false, reason: 'Notifications are not enabled.' };

  const now = Date.now();
  const lastReminderAt = lastReminderAtByZone.get(zoneName);
  if (lastReminderAt && now - lastReminderAt < REMINDER_COOLDOWN_MS) {
    return { ok: true, skipped: true as const, reason: 'A reminder was already scheduled recently.' };
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const zoneReminderAlreadyPending = scheduled.some((notification) => notification.content.data?.zoneName === zoneName);
  if (zoneReminderAlreadyPending) {
    return { ok: true, skipped: true as const, reason: 'A reminder for this handover zone is already pending.' };
  }

  const id = await Notifications.scheduleNotificationAsync({
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
