import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} scrollEnabled={false}>
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.text }]}>Sign up disabled</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            This demo uses the two-step login from `topjuice` reference.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            This demo requires a <Text style={{ fontWeight: '700' }}>student email</Text> for both Username and Password.
          </Text>
        </View>

        <Link href="/login" asChild>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} activeOpacity={0.9}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/')} activeOpacity={0.9}>
          <Text style={[styles.secondaryText, { color: colors.primary }]}>Skip (will be blocked)</Text>
        </TouchableOpacity>
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
    gap: 16,
  },
  headerSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 18,
  },
  infoBox: {
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#00000010',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
