import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { recordAppEvent } from './localDatabase';

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
  const finalStatus = current.granted ? current : await Notifications.requestPermissionsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('handover-reminders', {
      name: 'Handover reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await recordAppEvent('notification_permission', { granted: finalStatus.granted });
  return finalStatus.granted;
}

export async function scheduleHandoverReminder(zoneName: string) {
  const granted = await requestNotificationAccess();
  if (!granted) return { ok: false, reason: 'Notifications are not enabled.' };

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

  await recordAppEvent('notification_scheduled', { id, zoneName });
  return { ok: true, id };
}
