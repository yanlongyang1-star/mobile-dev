import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Brand, Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function Login2Screen() {
  const { signInStep2, step1Done, loading: authLoading, authMode } = useAuth();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!step1Done) router.replace('/login');
  }, [router, step1Done]);

  const onLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    Keyboard.dismiss();
    const ok = await signInStep2(username, password);
    if (!ok) {
      setError(
        authMode === 'firebase'
          ? 'Firebase sign in failed. Check email, password, and allowed university domain.'
          : 'Invalid login. Use username: student and password: unilease123'
      );
      return;
    }
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <View style={[styles.page, { backgroundColor: colors.background }]}>
        <View pointerEvents="none" style={[styles.geoBlock, styles.geoBlockA, { backgroundColor: colors.geometric }]} />
        <View pointerEvents="none" style={[styles.geoAccent, { backgroundColor: colors.accent }]} />

        <ScrollView contentContainerStyle={styles.container} scrollEnabled={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="verified" size={36} color={colors.text} />
            </View>

            <Text style={[styles.brandTitle, { color: colors.text }]}>{Brand.name}</Text>
            <Text style={[styles.brandSubtitle, { color: colors.secondary }]}>Step 2 · Secure sign-in</Text>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.secondary }]}>Username</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <MaterialIcons name="person-outline" size={20} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="your.name@university.edu"
                    placeholderTextColor={colors.muted}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setError('');
                    }}
                    autoCapitalize="none"
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
                    placeholder="Password"
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
                onPress={onLogin}
                disabled={authLoading}
                activeOpacity={0.9}>
                {authLoading ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.signInButtonText, { color: colors.onPrimary }]}>Sign In</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.footerText, { color: colors.muted }]}>
                {authMode === 'firebase' ? 'Complete Firebase sign in with the same university email.' : 'Demo: repeat student / unilease123.'}
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
    overflow: 'hidden',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  geoBlock: {
    position: 'absolute',
    opacity: 0.6,
  },
  geoBlockA: {
    width: 200,
    height: 200,
    top: 20,
    left: -60,
    transform: [{ rotate: '-12deg' }],
  },
  geoAccent: {
    position: 'absolute',
    width: 100,
    height: 4,
    bottom: 100,
    right: 28,
    opacity: 0.45,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.md,
    padding: 26,
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
    marginTop: 2,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
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
    paddingHorizontal: 12,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
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
    marginTop: 6,
    marginBottom: 16,
    width: '100%',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
});
