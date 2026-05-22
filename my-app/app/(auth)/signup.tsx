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

import { Colors } from '@/constants/theme';
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.logoCircle, { backgroundColor: `${colors.primary}22` }]}>
            <MaterialIcons name="school" size={42} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Create UniLease Account</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>Firebase Authentication with university email validation</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Display name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: '#D1D5DB', backgroundColor: colors.surface }]}
              value={displayName}
              onChangeText={setDisplayName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>University email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: '#D1D5DB', backgroundColor: colors.surface }]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@students.latrobe.edu.au"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Student ID (optional)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: '#D1D5DB', backgroundColor: colors.surface }]}
              value={studentId}
              onChangeText={(text) => {
                setStudentId(text);
                setError('');
              }}
              autoCapitalize="characters"
              placeholder="e.g. 12345678"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
              maxLength={32}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Password</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: '#D1D5DB', backgroundColor: colors.surface }]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry
              placeholder="Minimum 6 characters"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Confirm password</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: '#D1D5DB', backgroundColor: colors.surface }]}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              secureTextEntry
              placeholder="Re-enter password"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={[styles.secondaryText, { color: colors.primary }]}>Back to Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FEE2E2',
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryText: {
    fontWeight: '800',
  },
});
