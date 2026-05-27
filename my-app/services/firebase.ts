import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';
const extra = (Constants.manifest as any)?.extra ?? (Constants.expoConfig as any)?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
};
let app: ReturnType<typeof initializeApp> | null = null;
if (!firebaseConfig.apiKey) {
  // If API key missing, skip initialization so the app can run with local placeholder data.
  // eslint-disable-next-line no-console
  console.warn('Firebase API key not found. Configure FIREBASE_* vars in app config to enable Firebase.');
} else {
  try {
    app = getApps()[0] ?? initializeApp(firebaseConfig as any);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Firebase initialization error', e);
  }
}

// Export safe fallbacks when Firebase isn't initialized so consumers can handle nulls.
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let storageInstance: ReturnType<typeof getStorage> | null = null;

try {
  // Only call Firebase services if the app was initialized.
  if (app) {
    const getReactNativePersistence = (
      FirebaseAuth as typeof FirebaseAuth & {
        getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
      }
    ).getReactNativePersistence;
    const authOptions = getReactNativePersistence
      ? ({ persistence: getReactNativePersistence(AsyncStorage) } as Parameters<typeof initializeAuth>[1])
      : undefined;
    try {
      authInstance = initializeAuth(app, authOptions);
    } catch {
      authInstance = getAuth(app);
    }
    dbInstance = getFirestore(app);
    storageInstance = getStorage();
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Firebase service creation error', e);
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
