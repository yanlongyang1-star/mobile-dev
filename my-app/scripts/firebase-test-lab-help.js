const apkPath = process.argv[2] || '<PATH_TO_DOWNLOADED_APK>';

console.log(`
Firebase Test Lab next steps
============================

1. Build a release APK for Test Lab:

   npm run build:android:testlab

   If your teacher specifically asks for "production version", use:

   npm run build:android:production-apk

2. When EAS finishes, open the build URL and download the APK.

3. Upload the APK in Firebase Console:

   Firebase Console > your project > Test Lab > Run a test > Robo test

4. Suggested devices:

   - San CHIHUN: Pixel 5, Android 13, portrait, focus Campus/Firebase readiness
   - Yanlong Yang: Pixel 7, Android 14, portrait, focus login/browse/booking flow

5. Optional gcloud command, if Google Cloud SDK is installed and logged in:

   gcloud firebase test android run \\
     --type robo \\
     --app "${apkPath}" \\
     --device model=Pixel7,version=34,locale=en,orientation=portrait \\
     --timeout 5m \\
     --results-bucket cloud-test-\${GOOGLE_CLOUD_PROJECT}

Evidence to screenshot:

- EAS build success page and APK download button/link
- Firebase Test Lab matrix result
- Device model and Android version
- Logs tab
- Robo screenshots or video
- Short limitation note: Robo is smoke-level and does not replace Jest/manual tests
`);
