import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, User } from 'firebase/auth';
import { auth } from './firebase';

function requireAuth() {
  if (!auth) throw new Error('Firebase auth is not configured');
  return auth;
}

export async function signUp(email: string, password: string): Promise<User> {
  const userCred = await createUserWithEmailAndPassword(requireAuth(), email, password);
  return userCred.user;
}

export async function signIn(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(requireAuth(), email, password);
  return userCred.user;
}

export async function signOut() {
  await fbSignOut(requireAuth());
}
