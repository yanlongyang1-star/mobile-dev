import * as React from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

export type UniLeaseUser = { uid: string; username: string };

const DEMO_USERNAME = 'student';
const DEMO_PASSWORD = 'unilease123';

type AuthContextValue = {
  user: UniLeaseUser | null;
  loading: boolean;
  step1Done: boolean;
  signInStep1: (username: string, password: string) => Promise<boolean>;
  signInStep2: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UniLeaseUser | null>(null);
  const [step1Done, setStep1Done] = useState(false);
  const [step1Email, setStep1Email] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const normalize = (v: string) => v.trim();

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      step1Done,
      signInStep1: async (username: string, password: string) => {
        setLoading(true);
        try {
          const u = normalize(username);
          const p = normalize(password);
          // Demo login: keep credentials simple and require username/password to be different.
          const ok = u === DEMO_USERNAME && p === DEMO_PASSWORD && u !== p;
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
          const ok = u === DEMO_USERNAME && p === DEMO_PASSWORD && u !== p && step1Email != null && u === step1Email;
          if (!ok) return false;
          setUser({ uid: u, username: u });
          return true;
        } finally {
          setLoading(false);
        }
      },
      signOut: async () => {
        setUser(null);
        setStep1Done(false);
        setStep1Email(null);
      },
    };
  }, [loading, step1Done, user, step1Email]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
