# Firebase Test Lab Evidence Folder

Put the final APK, screenshots, logs and short videos for Assessment 4 here.

## Required files to capture

| File name | Owner | What it should show |
| --- | --- | --- |
| `eas-build-success.png` | Team | EAS build completed and APK download available |
| `san-pixel5-matrix.png` | San CHIHUN | Firebase Test Lab matrix for Pixel 5 / Android 13 |
| `san-pixel5-logs.png` | San CHIHUN | Logs tab from the same Test Lab run |
| `san-pixel5-robo-screenshots.png` | San CHIHUN | Robo screenshots or video evidence |
| `yanlong-pixel7-matrix.png` | Yanlong Yang | Firebase Test Lab matrix for Pixel 7 / Android 14 |
| `yanlong-pixel7-logs.png` | Yanlong Yang | Logs tab from the same Test Lab run |
| `yanlong-pixel7-robo-screenshots.png` | Yanlong Yang | Robo screenshots or video evidence |

## Commands

```bash
npm run testlab:preflight
npx eas-cli@latest login
npm run build:android:testlab
```

If a production-named build is required:

```bash
npm run build:android:production-apk
```

## Report wording

San CHIHUN tested the UniLease Android APK in Firebase Test Lab on a Pixel 5 running Android 13, focusing on Campus readiness, permissions and Firebase status. Yanlong Yang tested the same APK on a Pixel 7 running Android 14, focusing on login, browsing, item details and booking request flow. The Firebase Test Lab matrix, logs and Robo screenshots were used as cloud-device evidence alongside Jest, TypeScript and lint checks.

## Limitation wording

Firebase Test Lab Robo testing provides reproducible cloud-device smoke testing, but it does not replace manual validation of university email verification, full booking judgement or every custom user path. We combine it with Jest tests, local static checks and manual walkthrough evidence.
