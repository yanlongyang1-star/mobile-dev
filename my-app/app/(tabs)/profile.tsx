import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { MinimalButton } from '@/components/ui/minimal-button';
import { MinimalCard } from '@/components/ui/minimal-card';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { formatAuthError } from '@/services/auth';

export default function Profile() {
  const colors = useThemeColors();
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      <Text style={[styles.subtitle, { color: colors.secondary }]}>
        {Brand.name} · {Brand.tagline}
      </Text>

      <MinimalCard style={styles.cardGap}>
        <Text style={[styles.label, { color: colors.muted }]}>DISPLAY NAME</Text>
        <Text style={[styles.value, { color: colors.text }]}>{user?.username ?? 'Guest user'}</Text>

        <Text style={[styles.label, styles.fieldGap, { color: colors.muted }]}>ACCOUNT TYPE</Text>
        <Text style={[styles.value, { color: colors.text }]}>Student</Text>

        <Text style={[styles.label, styles.fieldGap, { color: colors.muted }]}>STATUS</Text>
        <Text style={[styles.value, { color: colors.text }]}>{user ? 'Signed in' : 'Not signed in'}</Text>

        {authMode === 'firebase' && user?.email ? (
          <>
            <Text style={[styles.label, styles.fieldGap, { color: colors.muted }]}>EMAIL</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>
            <Text style={[styles.label, styles.fieldGap, { color: colors.muted }]}>EMAIL VERIFIED</Text>
            <Text style={[styles.value, { color: user.emailVerified ? colors.text : colors.error }]}>
              {user.emailVerified ? 'Verified' : 'Pending — check your inbox'}
            </Text>
          </>
        ) : null}
      </MinimalCard>

      {authMode === 'firebase' && user && !user.emailVerified ? (
        <MinimalCard style={styles.cardGap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Verify university email</Text>
          <Text style={[styles.privacy, { color: colors.secondary }]}>
            After you tap the link in your email, come back here and tap Refresh status so the app and Firestore stay in sync.
          </Text>
          <View style={styles.verifyRow}>
            <MinimalButton
              label="Resend email"
              variant="outline"
              loading={verifyBusy}
              onPress={() => void onResendVerification()}
              style={styles.verifyBtn}
            />
            <MinimalButton
              label="Refresh status"
              loading={verifyBusy}
              onPress={() => void onRefreshVerification()}
              style={styles.verifyBtn}
            />
          </View>
        </MinimalCard>
      ) : null}

      {user ? (
        <MinimalCard style={styles.cardGap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Biometric unlock</Text>
          <Text style={[styles.privacy, { color: colors.secondary }]}>
            Uses your phone’s Face ID, Touch ID, or fingerprint. Matching happens in system software — UniLease never
            receives biometric images or templates, only whether the prompt succeeded.
          </Text>
          {Platform.OS !== 'web' ? (
            <Text style={[styles.bioHint, { color: colors.muted }]}>
              {hardwareOk
                ? `Available: ${biometricCaps?.labels.length ? biometricCaps.labels.join(', ') : 'Biometric'}`
                : 'No biometrics enrolled on this device (check OS Settings).'}
            </Text>
          ) : (
            <Text style={[styles.bioHint, { color: colors.muted }]}>Open the app on iOS/Android to enable biometrics.</Text>
          )}
          <View style={[styles.switchRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Unlock with biometrics next launch</Text>
            <Switch
              accessibilityLabel="Toggle biometric unlock for returning to the app"
              value={biometricUnlockSaved}
              disabled={!user || bioBusy || Platform.OS === 'web' || (!hardwareOk && !biometricUnlockSaved)}
              onValueChange={(v) => void onToggleBiometric(v)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.primary}
            />
          </View>
        </MinimalCard>
      ) : null}

      <MinimalButton label="Sign Out" onPress={onSignOut} style={styles.signOutBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 18,
    fontWeight: '600',
  },
  cardGap: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  privacy: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
    fontWeight: '500',
  },
  bioHint: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fieldGap: {
    marginTop: 14,
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
  },
  verifyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  verifyBtn: {
    flex: 1,
    height: 46,
  },
  signOutBtn: {
    marginTop: 4,
  },
});
