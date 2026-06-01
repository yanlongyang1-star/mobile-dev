# Firebase Test Lab Evidence Folder

Final APK, screenshots, logs and Robo evidence for Assessment 4 live here.

## Required files to capture

| File name | Owner | What it shows |
| --- | --- | --- |
| EAS build URL | Team | EAS build completed and APK download available: <https://expo.dev/accounts/qgdr-03/projects/my-app/builds/6e8dc1d0-affd-4889-825d-b49a0c949d0f> |
| `san-pixel5-matrix.png` | San CHIHUN | Firebase Test Lab matrix for Pixel 5 / Android 11 / API 30 |
| `san-pixel5-logs.png` | San CHIHUN | Logs tab from the same Test Lab run |
| `san-pixel5-robo-screenshots.png` | San CHIHUN | Robo screenshots or video evidence |
| `yanlong-pixel7-matrix.png` | Yanlong Yang | Firebase Test Lab matrix for Pixel 7 / Android 13 / API 33 |
| `yanlong-pixel7-logs.png` | Yanlong Yang | Logs tab from the same Test Lab run |
| `yanlong-pixel7-robo-screenshots.png` | Yanlong Yang | Robo screenshots or video evidence |
| `yanlong-pixel7-execution.png` | Yanlong Yang | Pixel 7 execution detail and crawl graph |

The APK used for Firebase Test Lab was saved locally as `UniLease-testlab.apk`. It is ignored by Git because APK files are large generated build artifacts.

## Completed Firebase Test Lab runs

| Owner | Matrix | Device | Started | Result | Crawl details |
| --- | --- | --- | --- | --- | --- |
| San CHIHUN (22162424) | [`matrix-13tabm0a7ljgk`](https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/6349751831038791453) | Pixel 5, API 30, portrait, English (United States) | 01/06/2026, 18:36 | Passed | 5m10s, 71 actions, 3 activities, 20 screens |
| Yanlong Yang (22519263) | [`matrix-dul5xpu8e4ofa`](https://console.firebase.google.com/project/fir-config-6fa5c/testlab/histories/bh.e66e78829591fbd0/matrices/7703526244991464826) | Pixel 7, API 33, portrait, English (United States) | 01/06/2026, 19:03 | Passed | 5m14s, 80 actions, 2 activities, 24 screens |

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

San CHIHUN tested the UniLease Android APK in Firebase Test Lab on a Pixel 5 running Android 11/API 30, focusing on Campus readiness, permissions and Firebase status. Yanlong Yang tested the same APK on a Pixel 7 running Android 13/API 33, focusing on login, browsing, item details and booking request flow. Both Robo test matrices passed with 0 failed devices. The Firebase Test Lab matrix, logs and Robo screenshots were used as cloud-device evidence alongside Jest, TypeScript and lint checks.

## Limitation wording

Firebase Test Lab Robo testing provides reproducible cloud-device smoke testing, but it does not replace manual validation of university email verification, full booking judgement or every custom user path. We combine it with Jest tests, local static checks and manual walkthrough evidence.
