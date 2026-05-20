# UniLease User Manual

## Getting Started

1. Install dependencies with `npm install`.
2. Start the app with `npm run start`.
3. For the demo login, use:
   - username: `student`
   - password: `unilease123`
4. To enable Firebase, create a `.env` file with the `FIREBASE_*` values referenced in `app.config.js`.
5. For native features such as AdMob, background location and notifications, use an EAS development or preview build.

## Main Features

### Sign In

Open the app and sign in using either demo credentials or a Firebase Authentication account. When Firebase is configured, use the Sign Up screen to create an account with an approved university email domain.

### Browse Equipment

Use the Browse tab to search and filter campus equipment such as laptops, calculators, cameras, tablets, audio equipment and textbooks. Tap an item to open its details.

### Request a Booking

From Item Details, tap Request Booking. Choose start and end dates, handover location, meetup time and payment method. The app calculates rental days, booking fee, deposit and total due.

### View My Bookings

Open My Bookings to view current and previous bookings. Demo bookings show the status flow from pending to approved, picked up and returned. Returned bookings support ratings.

### Campus Handover

Open Campus to use mobile-specific features:

- GPS check for the closest handover zone
- battery level and low-power status
- accelerometer-based movement signal
- handover reminder notification
- background handover monitoring task
- parallel readiness check for battery, SQLite, Firestore and GPS
- AdMob banner evidence in native builds

### Profile

Open Profile to view account status and sign out.

## Troubleshooting

### Firebase is not configured

If Firebase values are missing, the app continues using demo data and SQLite local storage. Add the `.env` values before demonstrating Firestore sync.

### AdMob banner does not show in Expo Go

This is expected. The app uses `react-native-google-mobile-ads`, which requires custom native code. Build with EAS preview/development before recording AdMob evidence.

### Location permission is denied

Open device settings and allow location permission for UniLease. Background monitoring also requires background location permission.

### Notifications do not appear

Check that notification permission is granted. On Android, verify the notification channel is not blocked in system settings.

### Test Lab is missing

Firebase Test Lab evidence must be produced from Firebase Console or Google Cloud after generating an APK/AAB.

### APK build fails

Check Expo/EAS credentials, package identifiers, and native module compatibility. Re-run typecheck, lint and tests before building.
