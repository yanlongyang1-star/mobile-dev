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

The app was built into a standalone Android APK with EAS and uploaded to Firebase Test Lab. Both students used a different Google-hosted Android device configuration for Robo testing.

| Owner | Device | Android/API | Matrix | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| San CHIHUN (22162424) | Pixel 5 | Android 11 / API 30 | [`matrix-13tabm0a7ljgk`](https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/6349751831038791453) | Passed, 0 failed / 1 passed / 1 total device | `artifacts/testlab/san-pixel5-matrix.png`, `artifacts/testlab/san-pixel5-logs.png`, `artifacts/testlab/san-pixel5-robo-screenshots.png` |
| Yanlong Yang (22519263) | Pixel 7 | Android 13 / API 33 | [`matrix-dul5xpu8e4ofa`](https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/7703526244991464826) | Passed, 0 failed / 1 passed / 1 total device | `artifacts/testlab/yanlong-pixel7-matrix.png`, `artifacts/testlab/yanlong-pixel7-logs.png`, `artifacts/testlab/yanlong-pixel7-robo-screenshots.png` |

San's Pixel 5 run started on 01/06/2026 at 18:36 and completed a 5 minute 10 second Robo crawl with 71 actions, 3 activities and 20 screens. Yanlong's Pixel 7 run started on 01/06/2026 at 19:03 and completed a 5 minute 14 second Robo crawl with 80 actions, 2 activities and 24 screens.

Test Lab result links:

- San execution: <https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/6349751831038791453/executions/bs.2a39905167331f15>
- Yanlong execution: <https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/7703526244991464826/executions/bs.e23223e54c079b9e>

Reflection: Test Lab proved that the APK installed, launched and survived automated navigation on real cloud Android devices. The Robo screenshots show the login, listing and posting screens being reached. The limitation is that Robo does not understand the intended booking scenario or university email verification flow, so the Test Lab evidence is combined with Jest tests, lint/typecheck and manual walkthrough checks.

## Deployment / Build Evidence

Build approach used:

```bash
npm run testlab:preflight
npx expo-doctor
npx eas-cli@latest login
npm run build:android:testlab
```

The APK build completed successfully in EAS:

- EAS build: <https://expo.dev/accounts/qgdr-03/projects/my-app/builds/6e8dc1d0-affd-4889-825d-b49a0c949d0f>
- APK artifact: <https://expo.dev/artifacts/eas/eDN99fdcELQRnzbNmcrnSP.apk>
- Local APK copy for Test Lab upload: `artifacts/testlab/UniLease-testlab.apk` (ignored by Git because APKs are large build artifacts)

`npm run testlab:preflight` passed before the Firebase Test Lab upload: TypeScript completed with no errors, Expo lint completed with no errors, and Jest passed 6 test suites / 12 tests.

Submission should include:

- APK or AAB build artifact
- EAS build URL or local build log
- screenshot of successful build
- notes about Firebase config and excluded secrets
- AdMob evidence from native build because `react-native-google-mobile-ads` is not supported in Expo Go

## Limitations and Improvements

**Completed in prototype and evidence:**

- Firebase project configured (`fir-config-6fa5c`) with local `.env` (not committed)
- Email/password sign-up with university domain validation
- Firestore `users/{uid}` profile on sign-up
- Email verification flow in Profile (resend + refresh)
- EAS Android APK built for Firebase Test Lab
- Firebase Test Lab Robo tests passed on Pixel 5 API 30 and Pixel 7 API 33

**Still recommended for final submission evidence:**

- Firestore screenshots for **listings**, **bookings**, status updates and ratings (after using those flows)
- GitHub and Azure DevOps contribution evidence
- AdMob banner screenshot from EAS development or preview build (not Expo Go)
- Screenshots of the updated Stitch-style Home, Explore, Post, Campus and Profile screens

**Future improvements:**

- Enforce verified email before booking
- Server-side domain validation (Cloud Functions or campus SSO)
- Full offline sync queue instead of simple SQLite/Firestore merge
- Deeper Test Lab / instrumented tests beyond Robo smoke runs
