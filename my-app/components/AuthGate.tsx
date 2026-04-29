import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const isAuthSegment = segments[0] === '(auth)';

    if (!user && !isAuthSegment) {
      // User not logged in, redirect to login
      router.replace('/login');
    } else if (user && isAuthSegment) {
      // User logged in, redirect to home
      router.replace('/');
    }
  }, [user, loading, segments]); // Removed pathname from dependency

  return null;
}

