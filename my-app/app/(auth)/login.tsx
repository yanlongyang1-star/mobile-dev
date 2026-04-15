import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const user = await signIn(email, password);
      setLoading(false);
      if (user) {
        router.replace('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setLoading(false);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} scrollEnabled={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.logoIcon, { color: colors.primary }]}>📚</Text>
          </View>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitleText, { color: colors.secondary }]}>Sign in with your student account</Text>
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

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: '#FF3B30' + '20' }]}>
              <Text style={[styles.errorText, { color: '#FF3B30' }]}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: colors.primary }]}
            onPress={onLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Section */}
        <View style={styles.signUpSection}>
          <Text style={[styles.signUpText, { color: colors.secondary }]}>Don't have an account?</Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.signUpLink, { color: colors.primary }]}>Create a new account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.infoIcon]}>ℹ️</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>Only students with valid university email addresses can create an account</Text>
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
  signInButton: {
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
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signUpSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpText: {
    fontSize: 14,
    marginBottom: 8,
  },
  signUpLink: {
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
