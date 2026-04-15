import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth');

    if (!user && !isAuthRoute) {
      router.replace('/auth/login');
    } else if (user && isAuthRoute) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  return null;
}
