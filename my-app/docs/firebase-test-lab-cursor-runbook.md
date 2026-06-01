# Firebase Test Lab Cursor Runbook

This is the exact workflow to run in Cursor Terminal for the Assessment 4 Firebase Test Lab evidence.

## What already exists in this app

- `eas.json` has Android APK build profiles.
- `package.json` has Test Lab build commands.
- Jest, TypeScript, and lint checks are already passing locally.
- EAS APK build and Firebase Test Lab evidence have now been completed for Assessment 4.

## 1. Pre-flight check

Run:

```bash
npm run testlab:preflight
```

Expected result:

- TypeScript: no errors
- Expo lint: no errors
- Jest: 6 test suites passed, 12 tests passed

Actual result on 01/06/2026: passed.

## 2. Log in to Expo / EAS

If EAS says `Not logged in`, run:

```bash
npx eas-cli@latest login
```

Use the team Expo account. This step must be done by a human because it asks for account credentials.

Check login:

```bash
npx eas-cli@latest whoami
```

## 3. Build APK for Firebase Test Lab

Recommended command:

```bash
npm run build:android:testlab
```

If the marker specifically wants a production-named build, run:

```bash
npm run build:android:production-apk
```

Both commands create an Android APK profile suitable for Firebase Test Lab Robo testing.

Actual EAS build used for Test Lab:

- Build URL: <https://expo.dev/accounts/qgdr-03/projects/my-app/builds/6e8dc1d0-affd-4889-825d-b49a0c949d0f>
- APK artifact: <https://expo.dev/artifacts/eas/eDN99fdcELQRnzbNmcrnSP.apk>

## 4. Download APK

When EAS finishes:

1. Open the EAS build URL printed in the terminal.
2. Download the `.apk` file.
3. Save it somewhere easy, for example:

```text
artifacts/testlab/UniLease-testlab.apk
```

Actual local APK copy: `artifacts/testlab/UniLease-testlab.apk`.

## 5. Upload to Firebase Test Lab

1. Open Firebase Console.
2. Choose the UniLease/Firebase project.
3. Go to **Test Lab**.
4. Click **Run a test**.
5. Choose **Robo test**.
6. Upload the APK.
7. Choose a device.
8. Start the test.

## 6. Device split for group evidence

| Student | Device | Android/API | Focus | Result |
| --- | --- | --- | --- | --- |
| San CHIHUN (22162424) | Pixel 5 | Android 11 / API 30 | Firebase readiness, Campus tools, permissions | Passed |
| Yanlong Yang (22519263) | Pixel 7 | Android 13 / API 33 | Login, browse, item detail, booking flow | Passed |

Firebase Test Lab matrix links:

- San: <https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/6349751831038791453>
- Yanlong: <https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/7703526244991464826>

## 7. Screenshots to submit

- EAS successful build page: captured through the EAS build URL above.
- APK download link/button: captured through the APK artifact URL above.
- Firebase Test Lab test matrix: `artifacts/testlab/san-pixel5-matrix.png`, `artifacts/testlab/yanlong-pixel7-matrix.png`.
- Device model and Android/API version: shown in each matrix screenshot.
- Logs tab: `artifacts/testlab/san-pixel5-logs.png`, `artifacts/testlab/yanlong-pixel7-logs.png`.
- Robo screenshots/video evidence: `artifacts/testlab/san-pixel5-robo-screenshots.png`, `artifacts/testlab/yanlong-pixel7-robo-screenshots.png`.

## 8. Report wording

Use this wording if Test Lab is asked in the presentation:

> We built a standalone Android APK with EAS and uploaded it to Firebase Test Lab. Test Lab ran a Robo smoke test on Google-hosted Android devices, giving us reproducible device evidence beyond testing only in Expo Go or on one local machine.

## 9. Limitation wording

> Firebase Test Lab Robo testing is useful for smoke testing navigation and crashes, but it cannot fully validate sign-up email verification, real payments, or every custom user path. We therefore combine Test Lab evidence with Jest tests, lint/typecheck, and manual app walkthroughs.
