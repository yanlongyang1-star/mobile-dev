import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const onSignOut = async () => {
    Alert.alert('Confirm Sign Out', 'Are you sure you want to sign out of UniLease?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>UniLease student account</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Display name</Text>
        <Text style={styles.value}>{user?.username ?? 'Guest user'}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Account type</Text>
        <Text style={styles.value}>Student</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Status</Text>
        <Text style={styles.value}>{user ? 'Signed in' : 'Not signed in'}</Text>
      </View>

      <TouchableOpacity onPress={onSignOut} style={styles.signOutButton} activeOpacity={0.92}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F8FA',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F1720',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    color: '#0F1720',
    fontWeight: '700',
  },
  signOutButton: {
    marginTop: 18,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
