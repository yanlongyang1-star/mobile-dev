# Firebase pitch evidence checklist

Use this when rehearsing for your lecturer. Tick each item after you capture a screenshot or live demo.

## Three Firebase technologies (say these names)

1. **Firebase Authentication** — sign-up, login, email verification  
2. **Cloud Firestore** — shared cloud database (`users`, `items`, `bookings`)  
3. **Firebase Test Lab** - automated Android device testing of the EAS APK

Plus **SQLite** on device (not Firebase) for offline booking reliability.

## Live demo order (~2 minutes)

| # | Show | Say |
| --- | --- | --- |
| 1 | App: **Create an account** | University email only; Firebase Auth creates the user |
| 2 | Console: **Authentication → Users** | Same account appears server-side |
| 3 | Console: **Firestore → users → {uid}** | Profile document: email, displayName, emailVerified |
| 4 | App: **Profile** tab | Verification status; Resend / Refresh after email link |
| 5 | App: **Campus** parallel check | SQLite + Firestore both Ready |
| 6 | Screenshot: **Test Lab** matrix | Cloud devices test our APK, not just Expo Go |

## Screenshots to collect

- [ ] Firestore `users/{uid}` (done if you signed up successfully)
- [ ] Authentication user list
- [ ] Profile showing email verified (before and after link)
- [x] Test Lab device matrix + pass/fail for San CHIHUN on Pixel 5 / Android 11 / API 30
- [x] Test Lab device matrix + pass/fail for Yanlong Yang on Pixel 7 / Android 13 / API 33
- [x] EAS APK build URL and APK artifact link

## Why each technology (short)

| Technology | Why we chose it |
| --- | --- |
| Authentication | Identify students; email/password fits assessment scope |
| Firestore | Share listings/bookings between users without running our own SQL server |
| Test Lab | Device coverage and assessment evidence for native preview builds |
| SQLite | Offline + restart-safe bookings on the phone |

## Honest limitations (one sentence each)

- Domain allowlist is checked in the app; production would validate on the server.  
- Firestore sync is merge-based, not a full offline queue.  
- Test Lab Robo tests are smoke-level, not a replacement for Jest or manual QA.  

## Evidence already working

If Firestore shows **`users`** with your La Trobe email, **Authentication + Firestore sign-up is proven**. Test Lab screenshots are now captured in `artifacts/testlab`; the remaining evidence gap is usually **listings/bookings** in Firestore after you use those features.

## Test Lab evidence now completed

- San CHIHUN (22162424): Pixel 5, Android 11/API 30, `matrix-13tabm0a7ljgk`, passed.
- Yanlong Yang (22519263): Pixel 7, Android 13/API 33, `matrix-dul5xpu8e4ofa`, passed.
- EAS APK build: <https://expo.dev/accounts/qgdr-03/projects/my-app/builds/6e8dc1d0-affd-4889-825d-b49a0c949d0f>
