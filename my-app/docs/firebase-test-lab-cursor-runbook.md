# Firebase Test Lab Cursor Runbook

This is the exact workflow to run in Cursor Terminal for the Assessment 4 Firebase Test Lab evidence.

## What already exists in this app

- `eas.json` has Android APK build profiles.
- `package.json` has Test Lab build commands.
- Jest, TypeScript, and lint checks are already passing locally.
- No APK/AAB artifact exists yet. Firebase Test Lab needs an APK/AAB built first.

## 1. Pre-flight check

Run:

```bash
npm run testlab:preflight
```

Expected result:

- TypeScript: no errors
- Expo lint: no errors
- Jest: 6 test suites passed, 12 tests passed

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

## 4. Download APK

When EAS finishes:

1. Open the EAS build URL printed in the terminal.
2. Download the `.apk` file.
3. Save it somewhere easy, for example:

```text
artifacts/testlab/UniLease-testlab.apk
```

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

| Student | Device | Android | Focus |
| --- | --- | --- | --- |
| San CHIHUN | Pixel 5 | Android 13 | Firebase readiness, Campus tools, permissions |
| Yanlong Yang | Pixel 7 | Android 14 | Login, browse, item detail, booking flow |

## 7. Screenshots to submit

- EAS successful build page.
- APK download link/button.
- Firebase Test Lab test matrix.
- Device model and Android version.
- Logs tab.
- Robo screenshots or video.

## 8. Report wording

Use this wording if Test Lab is asked in the presentation:

> We built a standalone Android APK with EAS and uploaded it to Firebase Test Lab. Test Lab ran a Robo smoke test on Google-hosted Android devices, giving us reproducible device evidence beyond testing only in Expo Go or on one local machine.

## 9. Limitation wording

> Firebase Test Lab Robo testing is useful for smoke testing navigation and crashes, but it cannot fully validate sign-up email verification, real payments, or every custom user path. We therefore combine Test Lab evidence with Jest tests, lint/typecheck, and manual app walkthroughs.
