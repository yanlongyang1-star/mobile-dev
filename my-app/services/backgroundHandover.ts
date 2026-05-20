import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { CAMPUS_ZONES, distanceMeters } from './campusCapabilities';
import { recordAppEvent } from './localDatabase';
import { scheduleHandoverReminder } from './notifications';

export const HANDOVER_LOCATION_TASK = 'unilease-handover-location-task';

TaskManager.defineTask(HANDOVER_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    await recordAppEvent('background_handover_error', { message: error.message });
    return;
  }

  const payload = data as { locations?: Location.LocationObject[] };
  const latest = payload.locations?.[0];
  if (!latest) return;

  const current = {
    latitude: latest.coords.latitude,
    longitude: latest.coords.longitude,
  };
  const nearest = CAMPUS_ZONES.map((zone) => ({
    ...zone,
    distance: distanceMeters(current, zone),
  })).sort((a, b) => a.distance - b.distance)[0];

  await recordAppEvent('background_handover_location', {
    nearest: nearest.name,
    distance: nearest.distance,
  });

  if (nearest.distance <= 120) {
    await scheduleHandoverReminder(nearest.name);
  }
});

export async function startHandoverLocationTask() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) return { ok: false, reason: 'Foreground location permission is required.' };

  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) return { ok: false, reason: 'Background location permission is required.' };

  const running = await Location.hasStartedLocationUpdatesAsync(HANDOVER_LOCATION_TASK);
  if (!running) {
    await Location.startLocationUpdatesAsync(HANDOVER_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 80,
      deferredUpdatesInterval: 10 * 60 * 1000,
      foregroundService: {
        notificationTitle: 'UniLease handover monitoring',
        notificationBody: 'Checking campus handover proximity for active bookings.',
      },
    });
  }

  await recordAppEvent('background_handover_started', {});
  return { ok: true };
}

export async function stopHandoverLocationTask() {
  const running = await Location.hasStartedLocationUpdatesAsync(HANDOVER_LOCATION_TASK);
  if (running) {
    await Location.stopLocationUpdatesAsync(HANDOVER_LOCATION_TASK);
  }
  await recordAppEvent('background_handover_stopped', {});
  return { ok: true };
}

export async function getHandoverTaskStatus() {
  const registered = await TaskManager.isTaskRegisteredAsync(HANDOVER_LOCATION_TASK);
  const running = registered ? await Location.hasStartedLocationUpdatesAsync(HANDOVER_LOCATION_TASK) : false;
  return { registered, running };
}
