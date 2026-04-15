import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const extra = (Constants.manifest as any)?.extra ?? (Constants.expoConfig as any)?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  // If API key missing, skip initialization so the app can run with local placeholder data.
  // eslint-disable-next-line no-console
  console.warn('Firebase API key not found. Configure FIREBASE_* vars in app config to enable Firebase.');
} else {
  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig as any);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Firebase initialization error', e);
    }
  }
}

// Export safe fallbacks when Firebase isn't initialized so consumers can handle nulls.
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

try {
  // Only call getAuth/getFirestore if the app was initialized
  if (getApps().length) {
    authInstance = getAuth();
    dbInstance = getFirestore();
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Firebase service creation error', e);
}

export const auth = authInstance;
export const db = dbInstance;
