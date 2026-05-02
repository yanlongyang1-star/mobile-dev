import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import type { BiometricCapabilities } from '@/services/biometricUnlock';
import {
  authenticateWithSystemPrompt,
  clearBiometricUnlockPreference,
  isBiometricUnlockEnabledAsync,
  readBiometricCapabilities,
  readStoredUserSnapshot,
  saveBiometricUnlockPreference,
} from '@/services/biometricUnlock';

export type UniLeaseUser = { uid: string; username: string };

const DEMO_USERNAME = 'student';
const DEMO_PASSWORD = 'unilease123';

/** Result from demo password gate + optional LocalAuthentication confirmation (native enrolled devices). */
export type DemoSignInOutcome = 'ok' | 'invalid_credentials' | 'biometric_canceled';

type AuthContextValue = {
  user: UniLeaseUser | null;
  loading: boolean;
  /** Cold start biometric gate + SecureStore hydrate; show splash until finished. */
  hydrating: boolean;
  step1Done: boolean;
  /** Capability probe (hardware + enrollment). Matching runs in OS, not JS. */
  biometricCaps: BiometricCapabilities | null;
  biometricUnlockSaved: boolean;
  refreshBiometricCaps: () => Promise<void>;
  /** Returns false if unavailable, user cancels biometric, or web. */
  setBiometricUnlockPreference: (enabled: boolean) => Promise<boolean>;
  /** Passwordless sign-in from saved SecureStore snapshot after OS biometric success. */
  attemptQuickBiometricSignIn: () => Promise<boolean>;
  /** Single-step demo sign-in — on native devices with enrolled biometric/device auth, confirms via OS prompt after correct password. */
  completeSignIn: (username: string, password: string) => Promise<DemoSignInOutcome>;
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
  const [hydrating, setHydrating] = useState(true);
  const [biometricCaps, setBiometricCaps] = useState<BiometricCapabilities | null>(null);
  const [biometricUnlockSaved, setBiometricUnlockSaved] = useState(false);

  const normalize = (v: string) => v.trim();

  const refreshBiometricCaps = useCallback(async () => {
    const caps = await readBiometricCapabilities();
    setBiometricCaps(caps);
    setBiometricUnlockSaved(await isBiometricUnlockEnabledAsync());
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const caps = await readBiometricCapabilities();
        const savedPref = await isBiometricUnlockEnabledAsync();
        if (!alive) return;
        setBiometricCaps(caps);
        setBiometricUnlockSaved(savedPref);

        if (Platform.OS === 'web') return;

        if (savedPref && caps.hardwareAvailable && caps.enrolled) {
          const snapshot = await readStoredUserSnapshot();
          if (snapshot) {
            const result = await authenticateWithSystemPrompt('Unlock UniLease');
            if (alive && result.success) {
              setUser(snapshot);
              setStep1Done(true);
              setStep1Email(snapshot.username);
            }
          }
        }
      } finally {
        if (alive) setHydrating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const completeSignIn = useCallback(async (username: string, password: string): Promise<DemoSignInOutcome> => {
    setLoading(true);
    try {
      const u = normalize(username);
      const p = normalize(password);
      if (u !== DEMO_USERNAME || p !== DEMO_PASSWORD) return 'invalid_credentials';

      // Native + enrolled → system Face ID / Touch ID / fingerprint / device-passcode sheet (matching stays in OS).
      if (Platform.OS !== 'web') {
        const caps = await readBiometricCapabilities();
        setBiometricCaps(caps);
        if (caps.enrolled) {
          const result = await authenticateWithSystemPrompt('Confirm sign-in to UniLease');
          if (!result.success) return 'biometric_canceled';
        }
      }

      const nextUser: UniLeaseUser = { uid: u, username: u };
      setStep1Done(true);
      setStep1Email(u);
      setUser(nextUser);
      return 'ok';
    } finally {
      setLoading(false);
    }
  }, []);

  const signInStep1 = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const u = normalize(username);
      const p = normalize(password);
      const ok = u === DEMO_USERNAME && p === DEMO_PASSWORD;
      if (!ok) return false;
      setStep1Done(true);
      setStep1Email(u);
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInStep2 = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      try {
        if (!step1Done) return false;
        const u = normalize(username);
        const p = normalize(password);
        const ok = u === DEMO_USERNAME && p === DEMO_PASSWORD && step1Email != null && u === step1Email;
        if (!ok) return false;
        setUser({ uid: u, username: u });
        return true;
      } finally {
        setLoading(false);
      }
    },
    [step1Done, step1Email]
  );

  const attemptQuickBiometricSignIn = useCallback(async () => {
    if (Platform.OS === 'web') return false;
    const enabled = await isBiometricUnlockEnabledAsync();
    if (!enabled) return false;
    const caps = await readBiometricCapabilities();
    setBiometricCaps(caps);
    if (!caps.hardwareAvailable || !caps.enrolled) return false;
    const snapshot = await readStoredUserSnapshot();
    if (!snapshot) return false;
    const res = await authenticateWithSystemPrompt('Sign in to UniLease');
    if (!res.success) return false;
    const nextUser: UniLeaseUser = { uid: snapshot.uid, username: snapshot.username };
    setUser(nextUser);
    setStep1Done(true);
    setStep1Email(nextUser.username);
    return true;
  }, []);

  const setBiometricUnlockPreference = useCallback(async (enabled: boolean) => {
    if (Platform.OS === 'web') return false;
    if (!user) return false;
    const caps = await readBiometricCapabilities();
    setBiometricCaps(caps);
    if (enabled) {
      if (!caps.hardwareAvailable || !caps.enrolled) return false;
      const res = await authenticateWithSystemPrompt('Turn on biometric unlock for UniLease');
      if (!res.success) return false;
      await saveBiometricUnlockPreference(user);
      setBiometricUnlockSaved(true);
      return true;
    }
    await clearBiometricUnlockPreference();
    setBiometricUnlockSaved(false);
    return true;
  }, [user]);

  const signOut = useCallback(async () => {
    setUser(null);
    setStep1Done(false);
    setStep1Email(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      hydrating,
      step1Done,
      biometricCaps,
      biometricUnlockSaved,
      refreshBiometricCaps,
      setBiometricUnlockPreference,
      attemptQuickBiometricSignIn,
      completeSignIn,
      signInStep1,
      signInStep2,
      signOut,
    };
  }, [
    biometricCaps,
    biometricUnlockSaved,
    attemptQuickBiometricSignIn,
    completeSignIn,
    hydrating,
    loading,
    refreshBiometricCaps,
    setBiometricUnlockPreference,
    signInStep1,
    signInStep2,
    signOut,
    step1Done,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
