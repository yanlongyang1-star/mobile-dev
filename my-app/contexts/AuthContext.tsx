import * as React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  isAllowedUniversityEmail,
  isFirebaseAuthConfigured,
  signIn,
  signOut as firebaseSignOut,
  signUp as firebaseSignUp,
  subscribeAuthState,
} from '@/services/auth';

export type UniLeaseUser = { uid: string; username: string };

const DEMO_USERNAME = 'student';
const DEMO_PASSWORD = 'unilease123';

type AuthContextValue = {
  user: UniLeaseUser | null;
  loading: boolean;
  step1Done: boolean;
  signInStep1: (username: string, password: string) => Promise<boolean>;
  signInStep2: (username: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  authMode: 'firebase' | 'demo';
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UniLeaseUser | null>(null);
  const [step1Done, setStep1Done] = useState(false);
  const [step1Email, setStep1Email] = useState<string | null>(null);
  const [loading, setLoading] = useState(isFirebaseAuthConfigured());

  const normalize = (v: string) => v.trim();
  const authMode = isFirebaseAuthConfigured() ? 'firebase' : 'demo';

  useEffect(() => {
    if (!isFirebaseAuthConfigured()) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeAuthState((firebaseUser) => {
      setUser(
        firebaseUser
          ? {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email || firebaseUser.uid,
            }
          : null
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      step1Done,
      authMode,
      signInStep1: async (username: string, password: string) => {
        setLoading(true);
        try {
          const u = normalize(username);
          const p = normalize(password);
          if (authMode === 'firebase') {
            const ok = Boolean(u && p && isAllowedUniversityEmail(u));
            if (!ok) return false;
            setStep1Done(true);
            setStep1Email(u);
            return true;
          }

          // Demo login: keep credentials simple while preserving the two-step flow.
          const ok = u === DEMO_USERNAME && p === DEMO_PASSWORD;
          if (!ok) return false;
          setStep1Done(true);
          setStep1Email(u);
          return true;
        } finally {
          setLoading(false);
        }
      },
      signInStep2: async (username: string, password: string) => {
        setLoading(true);
        try {
          if (!step1Done) return false;
          const u = normalize(username);
          const p = normalize(password);
          if (authMode === 'firebase') {
            if (!step1Email || u !== step1Email) return false;
            const firebaseUser = await signIn(u, p);
            setUser({
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email || firebaseUser.uid,
            });
            return true;
          }

          const ok = u === DEMO_USERNAME && p === DEMO_PASSWORD && step1Email != null && u === step1Email;
          if (!ok) return false;
          setUser({ uid: u, username: u });
          return true;
        } finally {
          setLoading(false);
        }
      },
      signUp: async (email: string, password: string, displayName?: string) => {
        if (authMode !== 'firebase') return false;
        setLoading(true);
        try {
          const firebaseUser = await firebaseSignUp(normalize(email), password, displayName);
          setUser({
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email || firebaseUser.uid,
          });
          return true;
        } finally {
          setLoading(false);
        }
      },
      signOut: async () => {
        if (authMode === 'firebase') {
          await firebaseSignOut();
        }
        setUser(null);
        setStep1Done(false);
        setStep1Email(null);
      },
    };
  }, [authMode, loading, step1Done, user, step1Email]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
