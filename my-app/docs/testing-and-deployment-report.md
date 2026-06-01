# UniLease Testing and Deployment Report

## Automated Test Coverage

The project includes six Jest test files:

- `__tests__/date.unit.test.ts`: validates date parsing, inclusive rental day calculation and date addition.
- `__tests__/listing-moderation.unit.test.ts`: verifies clean listing text is allowed and profanity is flagged/masked before submission.
- `__tests__/campus-distance.unit.test.ts`: verifies Campus handover distance logic chooses the nearest La Trobe zone.
- `__tests__/booking.integration.test.ts`: verifies item data integrates with booking quote and date validation logic.
- `__tests__/borrower-flow.e2e.test.ts`: models the borrower path from search to item selection, booking quote and handover data.
- `__tests__/login-ui.test.ts`: renders the login screen and checks invalid credentials show a clear error without navigation.

Run tests with:

```bash
npm run test
```

For a requirement-by-requirement implementation matrix, see `docs/assessment-requirement-checklist.md`.

## Static Quality Checks

Run:

```bash
npm run typecheck
npm run lint
```

Expected result: no TypeScript or lint errors.

## Manual Device Test Checklist

| Area | Test | Expected Result |
| --- | --- | --- |
| Firebase sign-up | Create account with `@students.latrobe.edu.au` | User reaches main tabs; **Authentication → Users** shows new user |
| Firestore profile | After sign-up, open Firestore **Data** | **`users/{uid}`** document with email, displayName, emailVerified |
| Email verification | Profile → Resend / Refresh after inbox link | **Email verified** becomes Yes; Firestore field updates |
| Firebase login | Sign in with same university email | Reaches main tabs (Firebase mode, not demo) |
| Login (demo fallback) | Without `.env`: `student` / `unilease123` | User reaches main tabs |
| Browse | Search `calculator` | Calculator listing appears |
| Item Details | Open listing | Details and request button appear |
| Booking | Submit valid dates | Booking appears in Explore |
| SQLite | Restart app after booking | Booking remains available |
| GPS | Tap Refresh GPS on Campus | App shows nearest campus zone or permission message |
| Battery | Tap Check Battery | Battery percentage and low-power mode display |
| Sensor | Move device on Campus screen | Motion signal updates |
| Notification | Tap Send Reminder | Handover reminder appears after a few seconds |
| Background task | Start/stop task | Task status changes |
| Parallel readiness | Campus → run parallel check | SQLite + Firestore show **Ready** when configured |

## Firebase Test Lab Evidence

Each student should run a different device configuration in Firebase Test Lab and include screenshots/logs. The app needs an EAS-built Android APK before Firebase Test Lab can run.

Suggested split:

- San CHIHUN (22162424): Pixel 5, Android 13, portrait Robo test focused on Campus readiness, permissions and Firebase status.
- Yanlong Yang (22519263): Pixel 7, Android 14, portrait Robo test focused on login, browsing, item detail and booking request flow.

Evidence to include:

- test matrix screenshot
- device model and Android version
- pass/fail status
- logs or screenshots from the run
- reflection on any failures or limitations

## Deployment / Build Evidence

Recommended build approach:

```bash
npm run testlab:preflight
npx expo-doctor
npx eas-cli@latest login
npm run build:android:testlab
```

Use `npm run build:android:production-apk` if the submission needs the build to be labelled as a production APK.

Submission should include:

- APK or AAB build artifact
- EAS build URL or local build log
- screenshot of successful build
- notes about Firebase config and excluded secrets
- AdMob evidence from native build because `react-native-google-mobile-ads` is not supported in Expo Go

## Limitations and Improvements

**Completed in prototype:**

- Firebase project configured (`fir-config-6fa5c`) with local `.env` (not committed)
- Email/password sign-up with university domain validation
- Firestore `users/{uid}` profile on sign-up
- Email verification flow in Profile (resend + refresh)

**Still recommended for final submission evidence:**

- Firestore screenshots for **listings**, **bookings**, status updates and ratings (after using those flows)
- Firebase Test Lab run screenshots (see `firebase-test-lab-script.md` and `artifacts/testlab/README.md`)
- APK/AAB build screenshots and EAS build URL
- GitHub and Azure DevOps contribution evidence
- AdMob banner screenshot from EAS development or preview build (not Expo Go)
- Screenshots of the updated Stitch-style Home, Explore, Post, Campus and Profile screens

**Future improvements:**

- Enforce verified email before booking
- Server-side domain validation (Cloud Functions or campus SSO)
- Full offline sync queue instead of simple SQLite/Firestore merge
- Deeper Test Lab / instrumented tests beyond Robo smoke runs
