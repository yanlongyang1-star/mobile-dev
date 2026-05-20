import Constants from 'expo-constants';
import type { AuthError } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import { saveUserProfileOnSignUp } from './firestore';

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

function isAuthError(e: unknown): e is AuthError {
  return typeof e === 'object' && e !== null && 'code' in e && typeof (e as AuthError).code === 'string';
}

/** Maps Firebase Auth errors to short UI strings. */
export function formatAuthError(error: unknown): string {
  if (isAuthError(error)) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'That email is already registered. Try signing in instead.';
      case 'auth/invalid-email':
        return 'That email address is not valid.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-up is disabled in Firebase. Enable it in the Firebase console.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Wait a moment and try again.';
      default:
        break;
    }
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function getConfiguredAuth() {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Set FIREBASE_* values in the app config before using auth services.');
  }
  return auth;
}

export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string,
  studentId?: string
): Promise<User> {
  if (!isAllowedUniversityEmail(email)) {
    const allowed = getAllowedDomains();
    const hint =
      allowed.length > 0 ? ` Use an address ending in: ${allowed.join(', ')}.` : ' Use your university email.';
    throw new Error(`Please use an approved university email address.${hint}`);
  }

  let userCred;
  try {
    userCred = await createUserWithEmailAndPassword(getConfiguredAuth(), email.trim(), password);
  } catch (e) {
    throw new Error(formatAuthError(e));
  }

  const name = displayName?.trim() || email.trim().split('@')[0] || 'Student';
  await updateProfile(userCred.user, { displayName: name });

  const profile = await saveUserProfileOnSignUp({
    uid: userCred.user.uid,
    email: userCred.user.email || email.trim(),
    displayName: name,
    studentId,
  });
  if (!profile.ok) {
    // eslint-disable-next-line no-console
    console.warn('[signUp] Firestore user profile:', profile.reason);
  }

  try {
    await sendEmailVerification(userCred.user);
  } catch (verifyErr) {
    // eslint-disable-next-line no-console
    console.warn('[signUp] sendEmailVerification:', verifyErr);
  }

  return userCred.user;
}

export async function signIn(email: string, password: string) {
  if (!isAllowedUniversityEmail(email)) {
    throw new Error('Please use an approved university email address.');
  }
  try {
    const userCred = await signInWithEmailAndPassword(getConfiguredAuth(), email.trim(), password);
    return userCred.user;
  } catch (e) {
    throw new Error(formatAuthError(e));
  }
}

export async function signOut() {
  await fbSignOut(getConfiguredAuth());
}

export function subscribeAuthState(onChange: (user: User | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, onChange);
}
