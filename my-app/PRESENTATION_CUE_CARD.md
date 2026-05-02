# UniLease — simple script + steps (cue card)

Fill in **[brackets]** before you record. Open on a **second screen**.

**How to read this file**

- **`Bold words`** = say them clearly; they are your **keywords**.
- **STEP** = what to **show** or **tap** on screen.
- **SAY** = **simple** wording; you can change it, keep the **bold** ideas.

---

## Your two features (say both names)

| | |
|--|--|
| **1** | **Biometrics** — **`expo-local-authentication`** + **`expo-secure-store`**. The **phone OS** does **Face ID / Touch ID / fingerprint / PIN**. Your app only gets **yes or no**. |
| **2** | **Profanity filter** — **`bad-words`** in **`profanityFilter.ts`**. **Create listing** checks **title + description** before publish. User sees **flagged words** and a **masked** hint. |

---

## Before recording

| STEP | SAY (optional) |
|------|----------------|
| Phone has **Expo Go**; run **`npx expo start`**; **QR** works. | *(no need to say)* |
| Pick **one bad test word** — **type only**, do **not** say it on the video. | *(no need to say)* |
| Have **student ID** ready. | *(no need to say)* |

---

## Part 1 — Intro (~0:00–1:30)

| STEP | SAY |
|------|-----|
| **Webcam** on. **Face** visible. Hold **ID card** still **5–10 seconds** so **name + photo** read clearly. | Hi, I’m **[name]**, student ID **[number]**. This is my **individual** **mobile prototyping** video for **UniLease** — a **student marketplace** app. |
| Lower ID; keep talking to camera. | I added **two** extra features past the labs. **First**, **biometric** sign-in and **unlock** with **`expo-local-authentication`**. The **OS** checks your **face / finger / PIN**. My code never gets **biometric data** — only **pass** or **fail**. I use **`expo-secure-store`** to save a small **demo profile** if the user turns **biometric unlock** on. |
| Same. | **Second**, I filter **bad language** on new listings with **`bad-words`**. Before **publish**, **`moderateText`** runs on the **title** and **description**. If it fails, the user sees **which words** broke the rule and a **censored** example. It runs **on the phone** in this demo. |
| Same. | Next I show **install**, then a **live demo** on a **real phone**, then **what works** and **what does not**. |

| STEP | SAY |
|------|-----|
| Cut or move camera to **laptop**. | Now I’ll show the **project** on my **laptop**. |

---

## Part 2 — Install (~1:30–4:45)

**Visual:** **Terminal** + **VS Code**. Folder **`my-app`**.

| STEP | SAY |
|------|-----|
| Show folder **`my-app`**. | This is my **Expo** app. **`package.json`** lists packages. The **`app`** folder is **Expo Router** screens. **`app.json`** is **config** for **iOS/Android**. |
| Terminal: **`cd my-app`** then **`npm install`**. | I run **`npm install`** to get all **dependencies**, including **`bad-words`**. |
| Open **`package.json`**. Point at **`expo-local-authentication`**, **`expo-secure-store`**, **`expo-image-picker`**, **`bad-words`**. | **Biometrics** and **secure storage** use these **Expo** packages. **Photos** use **`expo-image-picker`**. **Text filter** is **`bad-words`** — it is normal **JavaScript**, no extra **native** setup for that part. |
| Show or run: `npx expo install expo-local-authentication expo-secure-store expo-image-picker` | I use **`expo install`** so **versions match** this **Expo SDK**. |
| Open **`app.json`**. Show **`NSFaceIDUsageDescription`** and **photo** text under **`ios`** → **`infoPlist`**. | **Apple** needs a **privacy string** for **Face ID** and **photo library**. These lines explain **why** the app asks. |
| Scroll **`plugins`** in **`app.json`**. | **Plugins** hook in **native** bits for **secure storage** and **image picker**. |
| Open **`utils/profanityFilter.ts`** (quick scroll). | **`moderateText`** **wraps** **`bad-words`**: it tells me **yes/no**, **masked** text, and **flagged words** for the UI. |
| Open **`services/biometricUnlock.ts`** or name the file. | **Biometric** and **Secure Store** helpers live here. **`AuthContext`** ties it to **login**, **profile**, and **cold start**. Screens: **`login.tsx`**, **`profile.tsx`**, **`create-listing.tsx`**. |
| Run **`npx expo start`**. Show **QR**. | I open the app in **Expo Go** on a **real device** so **biometrics** are **real**, not **web**. |

| STEP | SAY |
|------|-----|
| Switch to **phone screen** (recording). | Now the **phone demo**. |

---

## Part 3 — Phone demo (~4:45–11:00)

| STEP | SAY |
|------|-----|
| Stay on **login**. | **Demo user** is **`student`** / **`unilease123`**. I tap **Sign In**. |
| **OS** popup appears (**Face ID**, **Touch ID**, or **PIN**). | This sheet is from **Apple** or **Google**, not my **custom** UI. My app only asks for **authentication**. **Matching** stays on the **device**. |
| *(If you already turned biometrics **on** in Profile)* Tap **Sign in with …** row if visible. | If I saved **biometric unlock**, I can also use this **shortcut** — same **system** check. |

| STEP | SAY |
|------|-----|
| Open **Profile** tab. Scroll to **Biometric unlock** gray text. | This text explains **privacy**: **biometric templates** stay in **system** hardware; the app gets **success** only. |
| Turn **Unlock with biometrics next launch** **ON**. Complete **system** prompt. | Turning it **ON** asks for another **prompt** — the user must **agree**. |

| STEP | SAY |
|------|-----|
| **Force quit** the app. Open it again. | I killed the app and opened it fresh. After **hydrate**, it asks **Unlock UniLease**. I prove **identity** again, then I’m in — **without** typing the password, because **Secure Store** + **preference** remember the **demo** user. |

| STEP | SAY |
|------|-----|
| Open **Create** / **create listing**. | **Biometrics** = **who** you are. **This screen** = **what** you post. |
| Fill **description** (required). Fill other fields. Tap **publish** / submit. | **Happy path**: clean text → **publish** succeeds. |
| *(Optional)* Tap **Add from gallery** → allow **photos** → pick image. | **Optional** photo uses **`expo-image-picker`** and **permissions**. |
| Add your **test bad word** in **title** or **description** — **type only**. Submit again. | I type a **`bad-words`** match **on screen** — I won’t say it aloud. Submit is **blocked**; message shows **flagged words** and **Try this** with **stars**. That string comes from **`moderateText`**. |
| Remove bad word; submit again. | Fixed text → **success** again. |

| STEP | SAY |
|------|-----|
| Cut to **webcam** (or slides). | Quick **critical** part — **honest limits**. |

---

## Part 4 — Critical analysis (~11:00–13:00)

| # | STEP | SAY |
|---|------|-----|
| 1 | **Face** or **simple slide**. | **Feasibility:** **Expo** packages make **biometrics** + **Secure Store** **easy** for a **prototype**. **Profanity** is one **import** and **`moderateText`**. Still **demo auth** — a **real** app needs a **backend** and **tokens**. |
| 2 | Same. | **Speed:** Very **cheap** — a few **async** calls at **login** / **unlock**; **strings** checked on **submit**. |
| 3 | Same. | **Devices:** **Biometrics** need a **physical phone**. **Web** skips them. Say that clearly — you are proving **correct** use, not **every** device. |
| 4 | Same. | **Privacy:** OS does **matching**; your JS never holds **Face ID data**. **Secure Store** is for **secrets** — in prod you’d store **sessions**, not pretend **accounts** forever. |
| 5 | Same. | **`bad-words`** is **English**-heavy and **easy to dodge** (**slang**, **spacing**, etc.). Good for **instant** feedback — **not** full **trust & safety**. You’d add **reports** + **server rules** later. |
| 6 | Same. | **Access:** Users can still use **password**. **Biometrics** are **optional**. |
| 7 | Same. | **Bottom line:** **Biometrics** = **nice** **unlock** helper for later **real login**. **`bad-words`** = **first check** only; **server** moderation would still win. |

---

## Part 5 — Close (~13:00 end)

| STEP | SAY |
|------|-----|
| **Webcam**. | Thanks. Credits: **Expo**, **Expo Router**, **`expo-local-authentication`**, **`expo-secure-store`**, **`expo-image-picker`**, **`bad-words`**, course **starter**. **Individual** submission. |

---

## 5-minute emergency version

| STEP | SAY (very short) |
|------|------------------|
| ID + face. | **[Name]**, ID **[number]**, **individual**, **UniLease**, **two** features: **biometrics** (**OS** check + **Secure Store**) and **`bad-words`** (**create listing**). |
| Laptop: **`npm install`**, show **`bad-words`** + **biometric** lines in **`package.json`**, one line **`app.json` Face ID**, **`expo start`**. | Installed deps; **`expo install`** pins natives; **`app.json`** explains **permissions**. |
| Phone: **Sign In** → **system prompt** → **create listing**: good submit → bad word **typed** → fix → OK. | **Live proof** — **prompt** + **block** + **retry**. |
| Face. | Works as **prototype**; **production** needs **server auth** and **better** **moderation**. |

---

## If they ask — one line each

| Question | SAY |
|----------|-----|
| Why client filter? | **Instant** UX; **server** still wins for **truth**. |
| Secure Store safe? | **Encrypted** locally; treat as **temporary** secrets. |
| Bypass **`bad-words`**? | **Yes** — it is **not** **security**. |

---

## Rehearse checklist

- [ ] **Cold start** **Unlock UniLease** tested  
- [ ] Profile **toggle** **ON** once today  
- [ ] **Description** filled before **publish**  
- [ ] Bad test word **typed** only  
- [ ] After **block**, **clean** submit works  
