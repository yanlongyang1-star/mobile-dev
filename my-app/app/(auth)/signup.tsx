import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { TextInput, ActivityIndicator } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function getAllowedDomains(): string[] {
  const extra = (Constants.manifest as any)?.extra ?? (Constants.expoConfig as any)?.extra ?? {};
  const list = extra.ALLOWED_UNI_DOMAINS ?? '';
  return String(list).split(',').map((s) => s.trim()).filter(Boolean);
}

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const allowed = getAllowedDomains();
    const domain = email.split('@')[1] ?? '';
    if (allowed.length && !allowed.includes(domain)) {
      setError(`Please use a valid university email (${allowed.join(', ')})`);
      return false;
    }

    return true;
  };

  const onSignUp = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const user = await signUp(email, password);
      setLoading(false);
      if (user) {
        router.replace('/');
      } else {
        setError('Sign up failed. Email may already be registered.');
      }
    } catch (err) {
      setLoading(false);
      setError('Sign up failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} scrollEnabled={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.logoIcon, { color: colors.primary }]}>🎓</Text>
          </View>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Join Us</Text>
          <Text style={[styles.subtitleText, { color: colors.secondary }]}>Create your student account</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Student Email</Text>
            <View style={[styles.inputContainer, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
              <Text style={[styles.inputIcon, { color: colors.primary }]}>✉️</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="your.email@university.edu"
                placeholderTextColor={colors.secondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
                underlineColor="transparent"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputContainer, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
              <Text style={[styles.inputIcon, { color: colors.primary }]}>🔒</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.secondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                editable={!loading}
                underlineColor="transparent"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading} style={styles.eyeIcon}>
                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
            <View style={[styles.inputContainer, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
              <Text style={[styles.inputIcon, { color: colors.primary }]}>🔒</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.secondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
                underlineColor="transparent"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading} style={styles.eyeIcon}>
                <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: '#FF3B30' + '20' }]}>
              <Text style={[styles.errorText, { color: '#FF3B30' }]}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: colors.primary }]}
            onPress={onSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign In Section */}
        <View style={styles.signInSection}>
          <Text style={[styles.signInText, { color: colors.secondary }]}>Already have an account?</Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.signInLink, { color: colors.primary }]}>Sign in here</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.infoIcon]}>ℹ️</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>We only accept emails from verified universities to ensure a safe student community</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signUpButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  signInText: {
    fontSize: 14,
    marginBottom: 8,
  },
  signInLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
});
