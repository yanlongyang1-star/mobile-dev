# Firebase setup for UniLease (Auth + Firestore + Storage + Test Lab)

Use this checklist for local dev and pitch demos. **Do not commit `.env`** — only `.env.example` stays in Git.

## 1. Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) → **Create project**.
2. **Add app** → **Web** → copy `firebaseConfig` fields.
3. **Build → Authentication → Sign-in method** → enable **Email/Password**.
4. **Build → Firestore Database** → create database (test mode OK for dev).
5. **Rules** → paste contents of `docs/firebase-firestore-rules.example` → **Publish**.
6. **Build → Storage** → **Get started** → choose a region (same as Firestore if possible).
7. **Storage → Rules** → paste contents of `docs/firebase-storage-rules.example` → **Publish**.

## 2. Local `.env`

```bash
cd my-app
cp .env.example .env
# Fill FIREBASE_* from Web app config
npx expo start --clear
```

Sign-up only works when `FIREBASE_API_KEY` is set. Without it, the app uses **demo login** (`student` / `unilease123`).

## 3. What the app does

| Feature | Firebase product | Code |
| --- | --- | --- |
| Sign up / login | Authentication | `services/auth.ts`, `contexts/AuthContext.tsx` |
| User profile, listings, bookings | Firestore | `services/firestore.ts`, `contexts/UniLeaseContext.tsx` |
| Listing photos | Cloud Storage | `services/storage.ts`, `app/(tabs)/create-listing.tsx` |
| Offline bookings | SQLite (local) | `services/localDatabase.ts` |
| Device testing (APK) | Test Lab | `docs/firebase-test-lab-script.md` |

## 4. Pitch demo (2 minutes)

1. Sign out → **Create an account** (university email domain in `ALLOWED_UNI_DOMAINS`).
2. Firebase Console → **Authentication → Users** (new user).
3. Firestore → **`users/{uid}`** document.
4. **Profile** tab → email verification status → **Resend** / **Refresh status**.
5. **Campus** → parallel readiness → SQLite + Firestore + Storage all **Ready**.
6. **Post** tab → add a listing photo → publish → Firebase **Storage → Files** shows `listings/{uid}/…` and Firestore `items/{id}.imageUrl` is the download URL.

## 5. Test Lab (assessment evidence)

```bash
npm run typecheck && npm run lint && npm run test
npm run build:android:preview
```

Upload the preview APK in Firebase **Test Lab** → Robo test → screenshot matrix + logs.

## 6. Evidence checklist

See **`docs/firebase-pitch-evidence.md`** for pitch rehearsal and screenshot list.
