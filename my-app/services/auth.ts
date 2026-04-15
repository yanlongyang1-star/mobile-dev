import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, User } from 'firebase/auth';
import { auth } from './firebase';

export async function signUp(email: string, password: string): Promise<User> {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function signIn(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function signOut() {
  await fbSignOut(auth);
}
