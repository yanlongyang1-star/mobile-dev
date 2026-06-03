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

import { CAMPUS_ZONES, distanceMeters, getCampusMapUrlCandidates } from '@/services/campusCapabilities';

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

  it('builds platform-specific map links with web fallbacks', () => {
    const zone = CAMPUS_ZONES[0];

    expect(getCampusMapUrlCandidates(zone, 'android')).toEqual([
      'geo:0,0?q=-37.7212%2C145.0484(Library%20Hub)',
      'https://www.google.com/maps/search/?api=1&query=-37.7212%2C145.0484',
    ]);
    expect(getCampusMapUrlCandidates(zone, 'ios')).toEqual([
      'comgooglemaps://?q=-37.7212%2C145.0484&center=-37.7212%2C145.0484&zoom=17',
      'http://maps.apple.com/?ll=-37.7212,145.0484&q=Library%20Hub',
      'https://www.google.com/maps/search/?api=1&query=-37.7212%2C145.0484',
    ]);
    expect(getCampusMapUrlCandidates(zone, 'web')).toEqual([
      'https://www.google.com/maps/search/?api=1&query=-37.7212%2C145.0484',
    ]);
  });
});
