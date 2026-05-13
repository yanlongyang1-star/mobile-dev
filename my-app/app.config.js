const dotenv = require('dotenv');

// Load .env from project root
dotenv.config();

module.exports = ({ config }) => {
  const androidAdMobAppId = process.env.ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713';
  const iosAdMobAppId = process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511';

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: androidAdMobAppId,
          iosAppId: iosAdMobAppId,
        },
      ],
    ],
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      ALLOWED_UNI_DOMAINS: process.env.ALLOWED_UNI_DOMAINS || 'students.latrobe.edu.au,latrobe.edu.au',
      ADMOB_ANDROID_APP_ID: androidAdMobAppId,
      ADMOB_IOS_APP_ID: iosAdMobAppId,
      ADMOB_BANNER_UNIT_ID:
        process.env.ADMOB_BANNER_UNIT_ID || 'ca-app-pub-3940256099942544/6300978111',
    },
  };
};
