# Assessment Requirement Checklist

This checklist maps each assessment requirement to the current UniLease implementation and the evidence to capture for submission.

| Requirement | Implemented evidence | Capture for submission |
| --- | --- | --- |
| Functional screens with clear navigation | Bottom tabs: Home, Explore, Post, Profile. Hidden flow screens: Item, Booking, Campus. Auth flow: Login and Sign Up. | Short video or screenshots covering Home -> Item -> Booking -> Explore, Post, Profile, Campus. |
| Firebase Authentication | `services/auth.ts`, `contexts/AuthContext.tsx`, Login and Sign Up screens support Firebase email/password when `.env` is configured. Demo auth remains fallback. | Firebase Auth console screenshot with a university email test user. |
| Firestore | `services/firestore.ts` syncs listings, bookings, booking status and ratings. `UniLeaseContext` calls Firestore with local fallback. | Firestore screenshots for `users`, `items`, and `bookings`. |
| Firebase Test Lab | `eas.json` and `package.json` include Test Lab APK build commands. `docs/firebase-test-lab-script.md` and `docs/firebase-test-lab-cursor-runbook.md` give APK upload and Robo test steps. Campus screen shows Test Lab readiness. | Firebase Test Lab matrix, device, logs and screenshots after APK build. |
| Sensors | Campus reads accelerometer via `expo-sensors` and displays motion signal. | Device screenshot while moving the phone. |
| Maps and GPS | Campus checks nearest handover zone via `expo-location` and includes an Open Map button for Google Maps coordinates. | Screenshot of GPS result and opened map. |
| Screens and data between screens | Home passes item ID to Item Details; Item Details stores selected item; Booking uses selected item to calculate fees; Explore shows created booking. | Record Home -> Item -> Request Booking -> Explore. |
| Battery | Campus reads battery level and low-power mode via `expo-battery`. | Device screenshot after tapping Check Battery. |
| Parallel Programming | Campus runs battery, SQLite, Firestore and GPS checks using `Promise.allSettled`. | Screenshot after tapping Run Parallel Check. |
| Work Manager / Task Manager | `services/backgroundHandover.ts` defines and controls a background handover location task with `expo-task-manager`. | Native build screenshot showing task start/stop status. |
| Notification | `services/notifications.ts` schedules handover reminders via `expo-notifications`. | Device notification screenshot after tapping Reminder. |
| AdMob | `components/AdMobBanner.tsx`, `app.config.js`, and `react-native-google-mobile-ads` are configured with Google sample IDs. | EAS/dev build screenshot because Expo Go/web show placeholder only. |
| Testing: Test Lab + Jest | Jest tests cover date utilities, listing moderation, Campus distance logic, booking integration, borrower flow and login UI. Test Lab script included. | Terminal screenshot of `npm run test`; Firebase Test Lab evidence. |
| APK and Builds | `eas.json` has Android APK preview, testlab and production-apk profiles. Use `npm run build:android:testlab` or `npm run build:android:production-apk`. | EAS build URL or APK artifact screenshot. |
| Reliable data storage and retrieval | `services/localDatabase.ts` uses SQLite for bookings and app events; bookings hydrate from SQLite and Firestore. | Demo restart or reload after booking; SQLite code screenshot if needed. |

## Important limitations to state honestly

- Firebase, Test Lab, native notifications, background location and AdMob need a configured Firebase project and an Android/iOS EAS build for final evidence.
- Web preview validates layout and routing, but native device capabilities must be captured on emulator or physical device.
