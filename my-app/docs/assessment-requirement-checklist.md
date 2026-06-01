# Assessment Requirement Checklist

This checklist maps each assessment requirement to the current UniLease implementation and the evidence to capture for submission.

| Requirement | Implemented evidence | Capture for submission |
| --- | --- | --- |
| Functional screens with clear navigation | Bottom tabs: Home, Explore, Post, Profile. Hidden flow screens: Item, Booking, Campus. Auth flow: Login and Sign Up. | Short video or screenshots covering Home -> Item -> Booking -> Explore, Post, Profile, Campus. |
| Firebase Authentication | `services/auth.ts`, `contexts/AuthContext.tsx`, Login and Sign Up screens support Firebase email/password when `.env` is configured. Demo auth remains fallback. | Firebase Auth console screenshot with a university email test user. |
| Firestore | `services/firestore.ts` syncs listings, bookings, booking status and ratings. `UniLeaseContext` calls Firestore with local fallback. | Firestore screenshots for `users`, `items`, and `bookings`. |
| Firebase Test Lab | EAS APK build completed and Firebase Test Lab Robo tests passed on two different cloud devices: San on Pixel 5/API 30 and Yanlong on Pixel 7/API 33. `docs/firebase-test-lab-cursor-runbook.md` records the exact build and matrix links. | Use `artifacts/testlab/san-pixel5-matrix.png`, `artifacts/testlab/san-pixel5-logs.png`, `artifacts/testlab/san-pixel5-robo-screenshots.png`, `artifacts/testlab/yanlong-pixel7-matrix.png`, `artifacts/testlab/yanlong-pixel7-logs.png`, `artifacts/testlab/yanlong-pixel7-robo-screenshots.png`. |
| Sensors | Campus reads accelerometer via `expo-sensors` and displays motion signal. | Device screenshot while moving the phone. |
| Maps and GPS | Campus checks nearest handover zone via `expo-location` and includes an Open Map button for Google Maps coordinates. | Screenshot of GPS result and opened map. |
| Screens and data between screens | Home passes item ID to Item Details; Item Details stores selected item; Booking uses selected item to calculate fees; Explore shows created booking. | Record Home -> Item -> Request Booking -> Explore. |
| Battery | Campus reads battery level and low-power mode via `expo-battery`. | Device screenshot after tapping Check Battery. |
| Parallel Programming | Campus runs battery, SQLite, Firestore and GPS checks using `Promise.allSettled`. | Screenshot after tapping Run Parallel Check. |
| Work Manager / Task Manager | `services/backgroundHandover.ts` defines and controls a background handover location task with `expo-task-manager`. | Native build screenshot showing task start/stop status. |
| Notification | `services/notifications.ts` schedules handover reminders via `expo-notifications`. | Device notification screenshot after tapping Reminder. |
| AdMob | `components/AdMobBanner.tsx`, `app.config.js`, and `react-native-google-mobile-ads` are configured with Google sample IDs. | EAS/dev build screenshot because Expo Go/web show placeholder only. |
| Testing: Test Lab + Jest | Jest tests cover date utilities, listing moderation, Campus distance logic, booking integration, borrower flow and login UI. `npm run testlab:preflight` passed with TypeScript, lint and 6 Jest suites / 12 tests. Firebase Test Lab also passed on both devices. | Terminal screenshot of `npm run testlab:preflight`; Firebase Test Lab screenshots/logs in `artifacts/testlab`. |
| APK and Builds | `eas.json` has Android APK preview, testlab and production-apk profiles. The Test Lab APK build is complete: <https://expo.dev/accounts/qgdr-03/projects/my-app/builds/6e8dc1d0-affd-4889-825d-b49a0c949d0f>. | EAS build URL and APK artifact URL: <https://expo.dev/artifacts/eas/eDN99fdcELQRnzbNmcrnSP.apk>. |
| Reliable data storage and retrieval | `services/localDatabase.ts` uses SQLite for bookings and app events; bookings hydrate from SQLite and Firestore. | Demo restart or reload after booking; SQLite code screenshot if needed. |

## Important limitations to state honestly

- Firebase, native notifications, background location and AdMob need a configured Firebase project and an Android/iOS EAS build for final evidence. Firebase Test Lab has already been completed with the Android APK evidence above.
- Web preview validates layout and routing, but native device capabilities must be captured on emulator or physical device.
