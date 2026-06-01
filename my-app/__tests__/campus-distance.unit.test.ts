jest.mock('expo-battery', () => ({
  getBatteryLevelAsync: jest.fn(),
  getBatteryStateAsync: jest.fn(),
  isLowPowerModeEnabledAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('@/services/firestore', () => ({
  getFirestoreHealth: jest.fn(),
}));

jest.mock('@/services/localDatabase', () => ({
  getLocalHealth: jest.fn(),
  recordAppEvent: jest.fn(),
}));

jest.mock('@/services/storage', () => ({
  getStorageHealth: jest.fn(),
}));

import { CAMPUS_ZONES, distanceMeters } from '@/services/campusCapabilities';

describe('campus handover distance unit rules', () => {
  it('chooses Library Hub as the closest zone for a Library Hub coordinate', () => {
    const current = { latitude: -37.72118, longitude: 145.04842 };
    const nearest = CAMPUS_ZONES.map((zone) => ({
      name: zone.name,
      distance: distanceMeters(current, zone),
    })).sort((a, b) => a.distance - b.distance)[0];

    expect(nearest).toEqual({ name: 'Library Hub', distance: expect.any(Number) });
    expect(nearest.distance).toBeLessThan(10);
  });
});
