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
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
          ? 'Incorrect email or password.'
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
      <SafeAreaView style={[styles.page, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandHeader}>
            <View style={[styles.logoButton, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="school" size={26} color={colors.primary} />
            </View>
            <View style={styles.brandText}>
              <Text style={[styles.brandTitle, { color: colors.primary }]}>{Brand.name}</Text>
              <Text style={[styles.brandSubtitle, { color: colors.secondary }]}>{Brand.tagline}</Text>
            </View>
          </View>

          <View style={[styles.hero, { backgroundColor: colors.hero }]}>
            <Text style={[styles.heroTitle, { color: colors.heroText }]}>Welcome back to UniLease.</Text>
            <Text style={[styles.heroCopy, { color: colors.heroText }]}>
              Sign in to browse campus gear, manage bookings, and post items for other verified students.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.keywordRow}>
              {Brand.keywords.map((word) => (
                <View key={word} style={[styles.keywordChip, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.keywordText, { color: colors.secondary }]}>{word}</Text>
                </View>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondary }]}>Username</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialIcons name="person-outline" size={20} color={colors.primary} />
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
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialIcons name="lock-outline" size={20} color={colors.primary} />
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
              activeOpacity={0.92}
            >
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
                activeOpacity={0.85}
              >
                <MaterialIcons name="fingerprint" size={25} color={colors.primary} />
                <Text style={[styles.bioRowText, { color: colors.text }]}>Sign in with {bioLabel}</Text>
                {bioBusy ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <MaterialIcons name="chevron-right" size={22} color={colors.icon} />
                )}
              </TouchableOpacity>
            ) : null}

            <Text style={[styles.footerText, { color: colors.secondary }]}>
              {authMode === 'firebase'
                ? 'Firebase mode: use your university email.'
                : 'Demo login: student / unilease123.'}
              {Platform.OS !== 'web'
                ? ' On devices with Face ID, Touch ID, or fingerprint set up in Settings, UniLease confirms with a system security prompt before signing you in.'
                : ''}
            </Text>

            {authMode === 'firebase' ? (
              <Text style={[styles.footerText, { color: colors.secondary, marginTop: 8 }]}>
                New to UniLease? Create an account with your university email below.
              </Text>
            ) : (
              <Text style={[styles.footerText, { color: colors.secondary, marginTop: 8 }]}>
                Demo mode: add FIREBASE_* in <Text style={{ color: colors.text, fontWeight: '900' }}>.env</Text> to enable real sign up.
                You can still open the sign-up screen to preview the form.
              </Text>
            )}

            <TouchableOpacity
              style={[styles.createAccountButton, { borderTopColor: colors.border }]}
              onPress={() => router.push('/signup')}
              disabled={authLoading}
              activeOpacity={0.88}
            >
              <Text style={[styles.createAccountText, { color: colors.primary }]}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 36,
  },
  brandHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  logoButton: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  brandText: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  hero: {
    borderRadius: Radius.lg,
    gap: 8,
    padding: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
  },
  heroCopy: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    opacity: 0.82,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  keywordChip: {
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  keywordText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    paddingLeft: 12,
  },
  errorBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '800',
  },
  signInButton: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 52,
    justifyContent: 'center',
    marginTop: 2,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  bioRow: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bioRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  createAccountButton: {
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  createAccountText: {
    fontSize: 13,
    fontWeight: '900',
  },
});
