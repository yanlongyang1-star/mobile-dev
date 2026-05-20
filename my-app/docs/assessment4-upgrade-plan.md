# UniLease Assessment 4 Upgrade Plan

## Product Direction

UniLease is upgraded from a simple demo marketplace into a campus-only, context-aware rental app for La Trobe students. The final product story is:

- verified student access
- browse academic equipment
- request bookings with deposits and payment summaries
- choose safe campus handover points
- use GPS, battery, sensors, notifications and background tasks to support handover
- persist bookings locally with SQLite and sync to Firestore when Firebase is configured

## Assessment Requirement Mapping

| Requirement | Current Implementation |
| --- | --- |
| Functional screens and navigation | Auth, Browse, Item Details, Booking Request, My Bookings, Create Listing, Campus, Profile |
| Firebase Authentication | Real Firebase email/password sign-up and sign-in are implemented when `.env` is configured; demo auth remains as fallback |
| Firestore | `services/firestore.ts` supports items, bookings, booking status updates and ratings |
| Firebase Test Lab | External evidence still required from Firebase console after APK/AAB build |
| Screens and data between screens | Browse passes item ID to Item Details; Item Details stores selected item for Booking Request |
| SQLite / reliable local storage | `services/localDatabase.ts` persists bookings and app events |
| GPS / location | Campus screen checks nearest campus handover zone |
| Sensors | Campus screen reads accelerometer movement for item condition context |
| Battery | Campus screen reads battery level and low-power mode |
| Parallel programming | Campus screen runs battery, SQLite, Firestore and GPS checks with `Promise.allSettled` |
| Task Manager / background work | Background handover location task uses `expo-task-manager` and `expo-location` |
| Notifications | Handover reminder notification can be scheduled from Campus screen |
| AdMob | `react-native-google-mobile-ads` is installed and configured with Google sample IDs; native EAS/dev build required |
| Jest testing | Unit, integration and e2e-style tests are included under `__tests__` |
| APK and builds | External EAS/APK build evidence still required |

## Three Sprint Evidence Structure

### Sprint 1: Foundation and Navigation

Goal: deliver the core app shell and borrowing flow.

User stories:

- As a student, I can sign in to access the campus marketplace.
- As a borrower, I can browse items by category and keyword.
- As a borrower, I can open item details and pass item data into booking request.

Evidence to capture:

- Git commits for auth, navigation and browse screens
- Sprint board screenshot with tasks for login, browse, item details and booking form

### Sprint 2: Data and Booking

Goal: deliver persistent booking behaviour and Firebase-ready architecture.

User stories:

- As a borrower, I can create a booking request with dates, fee, deposit and meetup location.
- As a returning user, I can see my bookings after app restart.
- As the product owner, I can explain why Authentication, Firestore and Test Lab are used.

Evidence to capture:

- SQLite booking persistence demo
- Firebase config screenshots without exposing secrets
- Firebase Authentication screenshot showing a created university email account
- Firestore collection screenshots for `items` and `bookings`

### Sprint 3: Context-Aware Mobile Features and Testing

Goal: deliver device-specific features and testing evidence.

User stories:

- As a borrower, I can find the closest campus handover zone using GPS.
- As a borrower, I can receive a handover reminder notification.
- As a team, we can verify core logic through Jest and device testing.

Evidence to capture:

- Campus screen screenshots for GPS, battery, sensor and notification functions
- Jest output screenshot
- Firebase Test Lab result screenshot
- APK or EAS build screenshot
- AdMob banner screenshot from a development or preview build

## Remaining External Evidence

These cannot be generated fully inside the source code:

- GitHub contribution screenshots for each contributor
- Azure DevOps board screenshots
- MS Teams collaboration evidence
- Firebase Test Lab device matrix result
- APK/AAB build artifact and build logs
- Short app walkthrough video or screenshots from a real/emulated device
