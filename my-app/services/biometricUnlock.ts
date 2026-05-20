import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

/** Persisted snapshot for demo biometric return-to-app flow (never stores biometrics themselves). */
export type BiometricUserSnapshot = { uid: string; username: string };

export const SECURE_BIO_ENABLED = 'uni_lease_biometric_unlock_enabled';
export const SECURE_USER_SNAPSHOT = 'uni_lease_biometric_user_snapshot';

export type BiometricCapabilities = {
  /** True when the device exposes Face ID / fingerprint / similar APIs. */
  hardwareAvailable: boolean;
  /** User has enrolled biometrics (or device lock) for the OS prompt. */
  enrolled: boolean;
  /** Human-readable labels for supported auth types (assignment / UI). */
  labels: string[];
};

function typeLabel(t: LocalAuthentication.AuthenticationType): string {
  switch (t) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'Fingerprint';
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return 'Face recognition';
    case LocalAuthentication.AuthenticationType.IRIS:
      return 'Iris';
    default:
      return 'Biometric';
  }
}

/** Read device + enrollment state. Matching still happens in the OS; JS only sees the result. */
export async function readBiometricCapabilities(): Promise<BiometricCapabilities> {
  if (Platform.OS === 'web') {
    return { hardwareAvailable: false, enrolled: false, labels: [] };
  }
  const hardwareAvailable = await LocalAuthentication.hasHardwareAsync();
  const enrolled = hardwareAvailable ? await LocalAuthentication.isEnrolledAsync() : false;
  const types = enrolled ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];
  return {
    hardwareAvailable,
    enrolled,
    labels: [...new Set(types.map(typeLabel))],
  };
}

export async function authenticateWithSystemPrompt(promptMessage: string) {
  return LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
}

export async function isBiometricUnlockEnabledAsync(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return (await SecureStore.getItemAsync(SECURE_BIO_ENABLED)) === 'true';
  } catch {
    return false;
  }
}

export async function readStoredUserSnapshot(): Promise<BiometricUserSnapshot | null> {
  if (Platform.OS === 'web') return null;
  try {
    const raw = await SecureStore.getItemAsync(SECURE_USER_SNAPSHOT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BiometricUserSnapshot;
    if (parsed && typeof parsed.uid === 'string' && typeof parsed.username === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function saveBiometricUnlockPreference(user: BiometricUserSnapshot) {
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(SECURE_BIO_ENABLED, 'true');
  await SecureStore.setItemAsync(SECURE_USER_SNAPSHOT, JSON.stringify(user));
}

export async function clearBiometricUnlockPreference() {
  if (Platform.OS === 'web') return;
  try {
    await SecureStore.deleteItemAsync(SECURE_BIO_ENABLED);
  } catch {
    /* no-op */
  }
  try {
    await SecureStore.deleteItemAsync(SECURE_USER_SNAPSHOT);
  } catch {
    /* no-op */
  }
}
