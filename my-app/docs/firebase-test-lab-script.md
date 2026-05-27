# Firebase Test Lab Script

## Purpose

Capture **Assessment 4** evidence for **Firebase Test Lab** (third Firebase technology alongside Authentication and Firestore). Each team member can run a **different device** and attach screenshots to the report.

**Project:** `firebaseConfig` (`fir-config-6fa5c`) in Firebase Console.

## Pre-flight (local)

```bash
cd my-app
npm run typecheck
npm run lint
npm run test
npm run build:android:preview
```

Download the **preview APK** from the EAS build page when the build finishes.

## Test Lab run (Console)

1. [Firebase Console](https://console.firebase.google.com/) → project **`firebaseConfig`**
2. Left menu → **Run** → **Test Lab** (or Quality → Test Lab)
3. **Run a test** → upload the preview **APK**
4. Test type: **Robo test** (automated UI exploration)
5. Select **one device** (see table below)
6. **Start test** → wait for completion

## Screenshots to save (submission / pitch)

- Device model + Android version selected
- Test **matrix** (running / passed / failed)
- **Logs** tab (expand one interesting line)
- Robo **screenshots or video** if generated
- Short reflection: what passed, what Robo could not cover (e.g. real email verification)

## Suggested device split

| Student | Device | Android | Focus flows |
| --- | --- | --- | --- |
| Student A | Pixel 7 | 14 | Login, sign-up, browse listings |
| Student B | Pixel 5 | 13 | Campus GPS, battery, notifications |
| Student C | Pixel 6 | 12 | Booking request, profile |

## Notes for report

- **Expo Go** cannot fully test **AdMob**, **background location**, or some native modules — use the **EAS preview APK** for Test Lab (expected for Expo + custom native code).
- **Robo test** is smoke-level; pair with Jest (`npm run test`) and manual device checklist in `testing-and-deployment-report.md`.
- Firebase **secrets** stay in local `.env` only — cite “configured via environment variables” in the report, not the API key.

## Pitch one-liner

> “We use Firebase Test Lab to run our Android preview build on Google-hosted devices, giving reproducible device evidence beyond testing on a single phone.”
