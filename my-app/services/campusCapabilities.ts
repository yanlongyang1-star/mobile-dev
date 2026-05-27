import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import { getFirestoreHealth } from './firestore';
import { getLocalHealth, recordAppEvent } from './localDatabase';
import { getStorageHealth } from './storage';

export type CampusZone = {
  name: string;
  latitude: number;
  longitude: number;
};

export const CAMPUS_ZONES: CampusZone[] = [
  { name: 'Library Hub', latitude: -37.7212, longitude: 145.0484 },
  { name: 'Engineering Building', latitude: -37.7204, longitude: 145.0497 },
  { name: 'Media Lab', latitude: -37.722, longitude: 145.0471 },
  { name: 'Student Union', latitude: -37.7209, longitude: 145.0466 },
  { name: 'Main Entrance', latitude: -37.7197, longitude: 145.0478 },
];

export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export async function getNearestCampusZone() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    await recordAppEvent('location_permission_denied', { status: permission.status });
    return { granted: false as const, message: 'Location permission was not granted.' };
  }

  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const current = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  const nearest = CAMPUS_ZONES.map((zone) => ({
    ...zone,
    distance: distanceMeters(current, zone),
  })).sort((a, b) => a.distance - b.distance)[0];

  await recordAppEvent('location_check', { nearest: nearest.name, distance: nearest.distance });
  return { granted: true as const, current, nearest };
}

export async function getBatterySnapshot() {
  const [level, state, lowPowerMode] = await Promise.all([
    Battery.getBatteryLevelAsync(),
    Battery.getBatteryStateAsync(),
    Battery.isLowPowerModeEnabledAsync(),
  ]);

  const roundedLevel = Math.round(level * 100);
  await recordAppEvent('battery_check', { level: roundedLevel, lowPowerMode });
  return {
    level: roundedLevel,
    state,
    lowPowerMode,
  };
}

export async function runParallelReadinessCheck() {
  const startedAt = Date.now();
  const [battery, localDb, firestore, storage, location] = await Promise.allSettled([
    getBatterySnapshot(),
    getLocalHealth(),
    getFirestoreHealth(),
    getStorageHealth(),
    getNearestCampusZone(),
  ]);

  const result = {
    durationMs: Date.now() - startedAt,
    battery,
    localDb,
    firestore,
    storage,
    location,
  };
  await recordAppEvent('parallel_readiness_check', { durationMs: result.durationMs });
  return result;
}
