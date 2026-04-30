import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { signInStep1, loading: authLoading } = useAuth();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const GREEN = '#16A34A';
  const BG = '#179B4B';
  const INPUT_BORDER = '#D1D5DB';
  const PLACEHOLDER = '#9CA3AF';

  const onLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    Keyboard.dismiss();

    const ok = await signInStep1(username, password);
    if (!ok) {
      setError('Invalid login. Use username: student and password: unilease123');
      return;
    }
    // Keep auth simple for demo: one-step sign in.
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        scrollEnabled={false}
      >
        <View style={styles.card}>
          <View style={[styles.logoCircle, { backgroundColor: `${GREEN}22` }]}>
            <MaterialIcons name="receipt" size={44} color={GREEN} />
          </View>

          <Text style={styles.brandTitle}>JuiceOps BI</Text>
          <Text style={styles.brandSubtitle}>Top Juice Parramatta</Text>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondary }]}>Username</Text>
              <View
                style={[
                  styles.inputContainer,
                  { borderColor: INPUT_BORDER, backgroundColor: colors.surface },
                ]}
              >
                <MaterialIcons name="person" size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="your.name@university.edu"
                  placeholderTextColor={PLACEHOLDER}
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
              <View
                style={[
                  styles.inputContainer,
                  { borderColor: INPUT_BORDER, backgroundColor: colors.surface },
                ]}
              >
                <MaterialIcons name="lock" size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="your.name@university.edu"
                  placeholderTextColor={PLACEHOLDER}
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
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: colors.primary }]}
              onPress={onLogin}
              disabled={authLoading}
              activeOpacity={0.9}
            >
              {authLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerText}>Use your student email for both fields.</Text>
          </View>
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
    overflow: 'hidden',
  },
  bgBlobA: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: '#BDE4F5',
    top: 20,
    left: -80,
  },
  bgBlobB: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#8FD3EA',
    bottom: 80,
    right: -70,
    opacity: 0.85,
  },
  bgBlobC: {
    position: 'absolute',
    width: 320,
    height: 120,
    borderRadius: 120,
    backgroundColor: '#EAF9FF',
    bottom: -10,
    left: -20,
    transform: [{ rotate: '-12deg' }],
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFFE8',
    borderWidth: 1,
    borderColor: '#FFFFFFB2',
    borderRadius: 18,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 4,
    color: '#111827',
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 18,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 54,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 10,
    color: '#111827',
  },
  errorBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FEE2E2',
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  signInButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
    width: '100%',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});
