import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { formatAuthError } from '@/services/auth';

export default function Profile() {
  const {
    user,
    signOut,
    authMode,
    refreshEmailVerificationStatus,
    requestVerificationEmailResend,
    biometricCaps,
    biometricUnlockSaved,
    refreshBiometricCaps,
    setBiometricUnlockPreference,
  } = useAuth();
  const router = useRouter();
  const [bioBusy, setBioBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshBiometricCaps();
      if (authMode === 'firebase') {
        void refreshEmailVerificationStatus();
      }
    }, [refreshBiometricCaps, authMode, refreshEmailVerificationStatus])
  );

  const onRefreshVerification = async () => {
    if (authMode !== 'firebase') return;
    setVerifyBusy(true);
    try {
      await refreshEmailVerificationStatus();
    } catch (e) {
      Alert.alert('Could not refresh', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setVerifyBusy(false);
    }
  };

  const onResendVerification = async () => {
    if (authMode !== 'firebase') return;
    setVerifyBusy(true);
    try {
      await requestVerificationEmailResend();
      Alert.alert('Email sent', 'Check your inbox (and spam) for a new verification link.');
    } catch (e) {
      Alert.alert('Could not send email', formatAuthError(e));
    } finally {
      setVerifyBusy(false);
    }
  };

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

        {authMode === 'firebase' && user?.email ? (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
            <Text style={[styles.label, { marginTop: 12 }]}>Email verified</Text>
            <Text style={[styles.value, user.emailVerified ? styles.verifiedYes : styles.verifiedNo]}>
              {user.emailVerified ? 'Yes' : 'No — open the link we emailed you'}
            </Text>
          </>
        ) : null}
      </View>

      {authMode === 'firebase' && user && !user.emailVerified ? (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Verify your university email</Text>
          <Text style={styles.privacy}>
            After you tap the link in your email, come back here and tap &quot;Refresh status&quot; so the app and
            Firestore stay in sync.
          </Text>
          <View style={styles.verifyRow}>
            <TouchableOpacity
              style={[styles.verifyButton, styles.verifyButtonSecondary]}
              onPress={() => void onResendVerification()}
              disabled={verifyBusy}
              activeOpacity={0.9}
            >
              {verifyBusy ? (
                <ActivityIndicator color="#0A84FF" />
              ) : (
                <Text style={styles.verifyButtonSecondaryText}>Resend email</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => void onRefreshVerification()}
              disabled={verifyBusy}
              activeOpacity={0.9}
            >
              {verifyBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Refresh status</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

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
  verifiedYes: {
    color: '#15803D',
  },
  verifiedNo: {
    color: '#B45309',
  },
  verifyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  verifyButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonSecondary: {
    backgroundColor: '#E2E8F0',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  verifyButtonSecondaryText: {
    color: '#0F1720',
    fontSize: 14,
    fontWeight: '800',
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
