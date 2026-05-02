import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useAuth } from '@/contexts/AuthContext';

const PRIMARY_BLUE = '#2563EB';
const PAGE_BG = '#EFF6FF';
const ICON_RING_BG = '#DBEAFE';
const INPUT_BORDER = '#E2E8F0';
const SUBTEXT = '#64748B';

export default function LoginScreen() {
  const router = useRouter();
  const {
    completeSignIn,
    loading: authLoading,
    biometricCaps,
    biometricUnlockSaved,
    refreshBiometricCaps,
    attemptQuickBiometricSignIn,
  } = useAuth();

  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('unilease123');
  const [error, setError] = useState('');
  const [bioBusy, setBioBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshBiometricCaps();
    }, [refreshBiometricCaps])
  );

  const showBiometricShortcut =
    Platform.OS !== 'web' &&
    biometricUnlockSaved &&
    !!(biometricCaps?.hardwareAvailable && biometricCaps?.enrolled);

  const bioLabel =
    biometricCaps?.labels?.length === 1
      ? biometricCaps.labels[0]
      : biometricCaps?.labels?.length
        ? biometricCaps.labels.join(' · ')
        : 'Biometric';

  const onLogin = async () => {
    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    Keyboard.dismiss();

    const outcome = await completeSignIn(username.trim(), password);
    if (outcome === 'invalid_credentials') {
      setError('Invalid login. Use username: student and password: unilease123');
      return;
    }
    if (outcome === 'biometric_canceled') {
      setError(
        'Sign-in canceled. Tap Sign In again and complete Face ID, Touch ID, fingerprint, or your device passcode when the system prompts you.'
      );
      return;
    }
    router.replace('/');
  };

  const onBiometricLogin = async () => {
    setError('');
    Keyboard.dismiss();
    setBioBusy(true);
    try {
      const ok = await attemptQuickBiometricSignIn();
      if (!ok) {
        setError('Biometric sign-in failed. Use username and password, or enable biometrics in Profile.');
      } else {
        router.replace('/');
      }
    } finally {
      setBioBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <View style={styles.page}>
        <View pointerEvents="none" style={[styles.bgBlob, styles.bgBlobA]} />
        <View pointerEvents="none" style={[styles.bgBlob, styles.bgBlobB]} />
        <View pointerEvents="none" style={[styles.bgBlob, styles.bgBlobC]} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={[styles.logoCircle, { backgroundColor: ICON_RING_BG }]}>
              <MaterialIcons name="school" size={42} color={PRIMARY_BLUE} />
            </View>

            <Text style={styles.brandTitle}>UniLease</Text>
            <Text style={styles.brandSubtitle}>Student Marketplace</Text>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={[styles.inputContainer, { borderColor: INPUT_BORDER }]}>
                  <MaterialIcons name="person" size={20} color={PRIMARY_BLUE} />
                  <TextInput
                    style={styles.input}
                    placeholder="student"
                    placeholderTextColor="#94A3B8"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setError('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!authLoading}
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, { borderColor: INPUT_BORDER }]}>
                  <MaterialIcons name="lock-outline" size={20} color={PRIMARY_BLUE} />
                  <TextInput
                    style={styles.input}
                    placeholder="unilease123"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    secureTextEntry
                    editable={!authLoading}
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: PRIMARY_BLUE }]}
                onPress={() => void onLogin()}
                disabled={authLoading}
                activeOpacity={0.92}>
                {authLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {showBiometricShortcut ? (
                <TouchableOpacity
                  style={styles.bioRow}
                  onPress={() => void onBiometricLogin()}
                  disabled={authLoading || bioBusy}
                  activeOpacity={0.85}>
                  <MaterialIcons name="fingerprint" size={26} color={PRIMARY_BLUE} />
                  <Text style={styles.bioRowText}>Sign in with {bioLabel}</Text>
                  {bioBusy ? (
                    <ActivityIndicator size="small" color={PRIMARY_BLUE} />
                  ) : (
                    <MaterialIcons name="chevron-right" size={22} color={SUBTEXT} />
                  )}
                </TouchableOpacity>
              ) : null}

              <Text style={styles.footerText}>
                Demo login: student / unilease123.
                {Platform.OS !== 'web'
                  ? ' On devices with Face ID, Touch ID, or fingerprint set up in Settings, UniLease confirms with an Apple/Google security prompt before signing you in.'
                  : ''}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: {
    flex: 1,
    backgroundColor: PAGE_BG,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgBlob: {
    position: 'absolute',
    opacity: 0.55,
  },
  bgBlobA: {
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: '#BFDBFE',
    top: -40,
    left: -100,
  },
  bgBlobB: {
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#93C5FD',
    bottom: 60,
    right: -80,
  },
  bgBlobC: {
    width: 340,
    height: 140,
    borderRadius: 140,
    backgroundColor: '#E0F2FE',
    bottom: -40,
    left: -36,
    transform: [{ rotate: '-14deg' }],
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SUBTEXT,
    marginTop: 4,
    marginBottom: 22,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SUBTEXT,
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 12,
    color: '#0F172A',
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#FEF2F2',
    width: '100%',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  signInButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
    borderRadius: 12,
  },
  bioRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 16,
    lineHeight: 18,
  },
});
