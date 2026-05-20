# UniLease Testing and Deployment Report

## Automated Test Coverage

The project includes three Jest test files:

- `__tests__/date.unit.test.ts`: validates date parsing, inclusive rental day calculation and date addition.
- `__tests__/booking.integration.test.ts`: verifies item data integrates with booking quote and date validation logic.
- `__tests__/borrower-flow.e2e.test.ts`: models the borrower path from search to item selection, booking quote and handover data.

Run tests with:

```bash
npm run test
```

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
| Login | Use demo credentials | User reaches main tabs |
| Home | Search `calculator` | Calculator listing appears |
| Item Details | Open listing | Details and request button appear |
| Booking | Submit valid dates | Booking appears in Explore |
| SQLite | Restart app after booking | Booking remains available |
| GPS | Tap Refresh GPS on Campus | App shows nearest campus zone or permission message |
| Battery | Tap Check Battery | Battery percentage and low-power mode display |
| Sensor | Move device on Campus screen | Motion signal updates |
| Notification | Tap Send Reminder | Handover reminder appears after a few seconds |
| Background task | Start/stop task | Task status changes |

## Firebase Test Lab Evidence

Each student should run a different device configuration in Firebase Test Lab and include screenshots/logs.

Suggested split:

- Student A: Pixel 7, Android 14, portrait smoke test.
- Student B: Pixel 5, Android 13, booking and Campus screen test.

Evidence to include:

- test matrix screenshot
- device model and Android version
- pass/fail status
- logs or screenshots from the run
- reflection on any failures or limitations

## Deployment / Build Evidence

Recommended build approach:

```bash
npm run typecheck
npm run lint
npm run test
npx expo-doctor
npm run build:android:preview
```

Submission should include:

- APK or AAB build artifact
- EAS build URL or local build log
- screenshot of successful build
- notes about Firebase config and excluded secrets
- AdMob evidence from native build because `react-native-google-mobile-ads` is not supported in Expo Go

## Limitations and Improvements

The current implementation is assessment-ready as a strong prototype, but final submission evidence still needs:

- real Firebase project values in `.env`
- Firebase Authentication screenshots showing a university email account
- Firestore screenshots showing synced listings, bookings, status updates and ratings
- Firebase Test Lab run screenshots
- APK/AAB build screenshots
- GitHub and Azure DevOps contribution evidence
- AdMob banner screenshot from EAS development or preview build
- screenshots of the updated Stitch-style Home, Explore, Post, Campus and Profile screens
