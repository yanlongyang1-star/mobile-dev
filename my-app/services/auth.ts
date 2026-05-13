import Constants from 'expo-constants';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

const extra = (Constants.manifest as any)?.extra ?? (Constants.expoConfig as any)?.extra ?? {};

function getAllowedDomains() {
  return String(extra.ALLOWED_UNI_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

export function isFirebaseAuthConfigured() {
  return auth != null;
}

export function isAllowedUniversityEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split('@')[1];
  const allowedDomains = getAllowedDomains();
  return Boolean(domain) && (allowedDomains.length === 0 || allowedDomains.includes(domain));
}

export function getConfiguredAuth() {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Set FIREBASE_* values in the app config before using auth services.');
  }
  return auth;
}

export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
  if (!isAllowedUniversityEmail(email)) {
    throw new Error('Please use an approved university email address.');
  }
  const userCred = await createUserWithEmailAndPassword(getConfiguredAuth(), email, password);
  if (displayName?.trim()) {
    await updateProfile(userCred.user, { displayName: displayName.trim() });
  }
  return userCred.user;
}

export async function signIn(email: string, password: string) {
  if (!isAllowedUniversityEmail(email)) {
    throw new Error('Please use an approved university email address.');
  }
  const userCred = await signInWithEmailAndPassword(getConfiguredAuth(), email, password);
  return userCred.user;
}

export async function signOut() {
  await fbSignOut(getConfiguredAuth());
}

export function subscribeAuthState(onChange: (user: User | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, onChange);
}
