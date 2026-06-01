# Firebase Test Lab Script

## Purpose

Capture **Assessment 4** evidence for **Firebase Test Lab** (third Firebase technology alongside Authentication and Firestore). San CHIHUN and Yanlong Yang ran **different devices** and saved screenshots/logs for the testing report.

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

Actual build used:

- EAS build: <https://expo.dev/accounts/qgdr-03/projects/my-app/builds/6e8dc1d0-affd-4889-825d-b49a0c949d0f>
- APK artifact: <https://expo.dev/artifacts/eas/eDN99fdcELQRnzbNmcrnSP.apk>

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

## Completed device split

| Student | Device | Android/API | Focus flows | Result |
| --- | --- | --- | --- | --- |
| San CHIHUN (22162424) | Pixel 5 | Android 11 / API 30 | Campus readiness, permissions, Firebase status | Passed |
| Yanlong Yang (22519263) | Pixel 7 | Android 13 / API 33 | Login, browse listings, item detail, booking request | Passed |

Matrix links:

- San: <https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/6349751831038791453>
- Yanlong: <https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/7703526244991464826>

## Notes for report

- **Expo Go** cannot fully test **AdMob**, **background location**, or some native modules - use the **EAS APK** for Test Lab (expected for Expo + custom native code).
- **Robo test** is smoke-level; pair with Jest (`npm run test`) and manual device checklist in `testing-and-deployment-report.md`.
- Firebase **secrets** stay in local `.env` only — cite “configured via environment variables” in the report, not the API key.

## Pitch one-liner

> “We use Firebase Test Lab to run our Android preview build on Google-hosted devices, giving reproducible device evidence beyond testing on a single phone.”
