# Firebase Test Lab Script

## Purpose

Capture **Assessment 4** evidence for **Firebase Test Lab** (third Firebase technology alongside Authentication and Firestore). San CHIHUN and Yanlong Yang should run **different devices** and attach screenshots/logs to the testing report.

**Project:** `firebaseConfig` (`fir-config-6fa5c`) in Firebase Console.

## Pre-flight (local)

```bash
cd my-app
npm run testlab:preflight
npx eas-cli@latest login
npm run build:android:testlab
```

If the marker specifically asks for a production-named build, use:

```bash
npm run build:android:production-apk
```

Download the **APK** from the EAS build page when the build finishes. Save the APK and screenshots under `artifacts/testlab/`.

## Test Lab run (Console)

1. [Firebase Console](https://console.firebase.google.com/) → project **`firebaseConfig`**
2. Left menu → **Run** → **Test Lab** (or Quality → Test Lab)
3. **Run a test** -> upload the **APK**
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
| San CHIHUN (22162424) | Pixel 5 | 13 | Campus readiness, permissions, Firebase status |
| Yanlong Yang (22519263) | Pixel 7 | 14 | Login, browse listings, item detail, booking request |

## Notes for report

- **Expo Go** cannot fully test **AdMob**, **background location**, or some native modules - use the **EAS APK** for Test Lab (expected for Expo + custom native code).
- **Robo test** is smoke-level; pair with Jest (`npm run test`) and manual device checklist in `testing-and-deployment-report.md`.
- Firebase **secrets** stay in local `.env` only — cite “configured via environment variables” in the report, not the API key.

## Pitch one-liner

> “We use Firebase Test Lab to run our Android preview build on Google-hosted devices, giving reproducible device evidence beyond testing on a single phone.”
