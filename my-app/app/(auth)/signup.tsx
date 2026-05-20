import React, { useState } from 'react';
import {
  Alert,
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
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, authMode, loading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    Keyboard.dismiss();
    setError('');

    if (authMode !== 'firebase') {
      setError('Firebase is not configured. Use demo login or add FIREBASE_* values in .env.');
      return;
    }
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setError('Enter a name, university email and password with at least 6 characters.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const sid = studentId.trim();
      const ok = await signUp(email, password, displayName, sid || undefined);
      if (!ok) {
        setError('Sign up failed. Check Firebase configuration and allowed email domain.');
        return;
      }
      Alert.alert(
        'Verify your email',
        'We sent a verification link to your university inbox. Check spam folders too. You can use the app now; some schools require verified email for certain actions.',
        [{ text: 'Continue', onPress: () => router.replace('/') }]
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed.');
    }
  };

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <View style={[styles.page, { backgroundColor: colors.background }]}>
        <View pointerEvents="none" style={[styles.geoBlock, styles.geoBlockA, { backgroundColor: colors.geometric }]} />
        <View pointerEvents="none" style={[styles.geoAccent, { backgroundColor: colors.accent }]} />

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.logoBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="verified-user" size={36} color={colors.text} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>
              Secure registration · university email verification
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondary }]}>Display name</Text>
              <TextInput style={inputStyle} value={displayName} onChangeText={setDisplayName} editable={!loading} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondary }]}>University email</Text>
              <TextInput
                style={inputStyle}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="name@students.latrobe.edu.au"
                placeholderTextColor={colors.muted}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondary }]}>Student ID (optional)</Text>
              <TextInput
                style={inputStyle}
                value={studentId}
                onChangeText={(text) => {
                  setStudentId(text);
                  setError('');
                }}
                autoCapitalize="characters"
                placeholder="e.g. 12345678"
                placeholderTextColor={colors.muted}
                editable={!loading}
                maxLength={32}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondary }]}>Password</Text>
              <TextInput
                style={inputStyle}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.muted}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondary }]}>Confirm password</Text>
              <TextInput
                style={inputStyle}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry
                placeholder="Re-enter password"
                placeholderTextColor={colors.muted}
                editable={!loading}
              />
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.errorSurface, borderColor: colors.errorBorder }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onSubmit}
              disabled={loading}>
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {loading ? 'Creating...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <Link href="/login" asChild>
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]}>
                <Text style={[styles.secondaryText, { color: colors.text }]}>Back to Login</Text>
              </TouchableOpacity>
            </Link>
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
  geoBlock: {
    position: 'absolute',
    opacity: 0.6,
  },
  geoBlockA: {
    width: 180,
    height: 180,
    top: 48,
    left: -40,
    transform: [{ rotate: '-10deg' }],
  },
  geoAccent: {
    position: 'absolute',
    width: 80,
    height: 4,
    top: 100,
    right: 24,
    opacity: 0.45,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: Radius.md,
    padding: 24,
    borderWidth: 1,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  errorBox: {
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  errorText: {
    fontWeight: '600',
    fontSize: 13,
  },
  button: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
  },
  secondaryText: {
    fontWeight: '800',
    fontSize: 13,
  },
});
