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

import { Brand, Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const {
    authMode,
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
      setError(
        authMode === 'firebase'
          ? 'Use an approved university email and your Firebase password.'
          : 'Invalid login. Use username: student and password: unilease123'
      );
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
      <View style={[styles.page, { backgroundColor: colors.background }]}>
        <View pointerEvents="none" style={[styles.geoBlock, styles.geoBlockA, { backgroundColor: colors.geometric }]} />
        <View pointerEvents="none" style={[styles.geoBlock, styles.geoBlockB, { backgroundColor: colors.geometricMuted }]} />
        <View pointerEvents="none" style={[styles.geoAccent, { backgroundColor: colors.accent }]} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="shield" size={36} color={colors.text} />
            </View>

            <Text style={[styles.brandTitle, { color: colors.text }]}>{Brand.name}</Text>
            <Text style={[styles.brandSubtitle, { color: colors.secondary }]}>{Brand.tagline}</Text>
            <View style={styles.keywordRow}>
              {Brand.keywords.map((word) => (
                <View key={word} style={[styles.keywordChip, { borderColor: colors.border }]}>
                  <Text style={[styles.keywordText, { color: colors.muted }]}>{word}</Text>
                </View>
              ))}
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.secondary }]}>Username</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <MaterialIcons name="person-outline" size={20} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={authMode === 'firebase' ? 'your.name@university.edu' : 'student'}
                    placeholderTextColor={colors.muted}
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
                <Text style={[styles.label, { color: colors.secondary }]}>Password</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <MaterialIcons name="lock-outline" size={20} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={authMode === 'firebase' ? 'Firebase password' : 'unilease123'}
                    placeholderTextColor={colors.muted}
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
                <View style={[styles.errorBox, { backgroundColor: colors.errorSurface, borderColor: colors.errorBorder }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: colors.primary }]}
                onPress={() => void onLogin()}
                disabled={authLoading}
                activeOpacity={0.92}>
                {authLoading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.signInButtonText, { color: colors.onPrimary }]}>Sign In</Text>
                )}
              </TouchableOpacity>

              {showBiometricShortcut ? (
                <TouchableOpacity
                  style={[styles.bioRow, { borderColor: colors.border }]}
                  onPress={() => void onBiometricLogin()}
                  disabled={authLoading || bioBusy}
                  activeOpacity={0.85}>
                  <MaterialIcons name="fingerprint" size={24} color={colors.text} />
                  <Text style={[styles.bioRowText, { color: colors.text }]}>Sign in with {bioLabel}</Text>
                  {bioBusy ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
                  )}
                </TouchableOpacity>
              ) : null}

              <Text style={[styles.footerText, { color: colors.muted }]}>
                {authMode === 'firebase'
                  ? 'Firebase mode: use your university email.'
                  : 'Demo login: student / unilease123.'}
                {Platform.OS !== 'web'
                  ? ' On devices with Face ID, Touch ID, or fingerprint set up in Settings, UniLease confirms with an Apple/Google security prompt before signing you in.'
                  : ''}
              </Text>

              {authMode === 'firebase' ? (
                <Text style={[styles.footerText, { marginTop: 8, color: colors.muted }]}>
                  New to UniLease? Create an account with your university email below.
                </Text>
              ) : (
                <Text style={[styles.footerText, { marginTop: 8, color: colors.muted }]}>
                  Demo mode: add FIREBASE_* in <Text style={{ fontWeight: '700', color: colors.text }}>.env</Text> to enable real sign up.
                  You can still open the sign-up screen to preview the form.
                </Text>
              )}

              <TouchableOpacity
                style={[styles.createAccountButton, { borderColor: colors.border }]}
                onPress={() => router.push('/signup')}
                disabled={authLoading}
                activeOpacity={0.88}>
                <Text style={[styles.createAccountText, { color: colors.text }]}>Create an account</Text>
              </TouchableOpacity>
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
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  geoBlock: {
    position: 'absolute',
    opacity: 0.65,
  },
  geoBlockA: {
    width: 200,
    height: 200,
    top: -24,
    right: -48,
    transform: [{ rotate: '12deg' }],
  },
  geoBlockB: {
    width: 160,
    height: 280,
    bottom: 40,
    left: -56,
    transform: [{ rotate: '-8deg' }],
  },
  geoAccent: {
    position: 'absolute',
    width: 120,
    height: 4,
    bottom: 120,
    right: 32,
    opacity: 0.5,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.md,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  keywordChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  keywordText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    paddingLeft: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 12,
  },
  errorBox: {
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 14,
    width: '100%',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  signInButton: {
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  bioRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 16,
    lineHeight: 18,
  },
  createAccountButton: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    width: '100%',
  },
  createAccountText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
