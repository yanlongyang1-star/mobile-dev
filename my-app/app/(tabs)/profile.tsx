import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const {
    user,
    signOut,
    biometricCaps,
    biometricUnlockSaved,
    refreshBiometricCaps,
    setBiometricUnlockPreference,
  } = useAuth();
  const router = useRouter();
  const [bioBusy, setBioBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshBiometricCaps();
    }, [refreshBiometricCaps])
  );

  const onSignOut = async () => {
    Alert.alert('Confirm Sign Out', 'Are you sure you want to sign out of UniLease?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const onToggleBiometric = async (next: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not on web', 'Biometric unlock is only available on a physical device.');
      return;
    }
    setBioBusy(true);
    try {
      const ok = await setBiometricUnlockPreference(next);
      if (!ok && next) {
        Alert.alert(
          'Could not enable',
          biometricCaps?.hardwareAvailable && biometricCaps.enrolled
            ? 'Biometric confirmation was canceled or failed. Your fingerprint or face data never leaves your device — we only get a yes/no from iOS/Android.'
            : 'This device needs biometrics (or screen lock) set up in Settings first.'
        );
      }
      await refreshBiometricCaps();
    } finally {
      setBioBusy(false);
    }
  };

  const hardwareOk = !!(biometricCaps?.hardwareAvailable && biometricCaps.enrolled);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>UniLease student account</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Display name</Text>
        <Text style={styles.value}>{user?.username ?? 'Guest user'}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Account type</Text>
        <Text style={styles.value}>Student</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Status</Text>
        <Text style={styles.value}>{user ? 'Signed in' : 'Not signed in'}</Text>
      </View>

      {user ? (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Biometric unlock</Text>
          <Text style={styles.privacy}>
            Uses your phone’s Face ID, Touch ID, or fingerprint. Matching happens in system software — UniLease never
            receives biometric images or templates, only whether the prompt succeeded (privacy-preserving model).
          </Text>
          {Platform.OS !== 'web' ? (
            <Text style={styles.bioHint}>
              {hardwareOk
                ? `Available: ${biometricCaps?.labels.length ? biometricCaps.labels.join(', ') : 'Biometric'}`
                : 'No biometrics enrolled on this device (check OS Settings).'}
            </Text>
          ) : (
            <Text style={styles.bioHint}>Open the app on iOS/Android to enable biometrics.</Text>
          )}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Unlock with biometrics next launch</Text>
            <Switch
              accessibilityLabel="Toggle biometric unlock for returning to the app"
              value={biometricUnlockSaved}
              disabled={!user || bioBusy || Platform.OS === 'web' || (!hardwareOk && !biometricUnlockSaved)}
              onValueChange={(v) => void onToggleBiometric(v)}
            />
          </View>
        </View>
      ) : null}

      <TouchableOpacity onPress={onSignOut} style={styles.signOutButton} activeOpacity={0.92}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F8FA',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F1720',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1720',
    marginBottom: 8,
  },
  privacy: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 10,
    fontWeight: '500',
  },
  bioHint: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F1720',
  },
  infoCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    color: '#0F1720',
    fontWeight: '700',
  },
  signOutButton: {
    marginTop: 4,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
