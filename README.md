# TourPack (React Native / Expo)

The mobile version of the TourPack app — Sign Up, Sign In, and Explorer
Dashboard — built with **React Native** and **Expo**, following your
Lesson 1–4 React Native notes.

## Setup

1. **Install Node.js** (v18+) from https://nodejs.org if you don't have it.
   ```
   node -v
   npm -v
   ```

2. **Install the Expo CLI globally** (optional — `npx` works without this too):
   ```
   npm install -g expo
   ```

3. **Unzip this project**, then open a terminal inside the `tourpack-native` folder.

4. **Install dependencies:**
   ```
   npm install
   ```

5. **Start the dev server:**
   ```
   npx expo start
   ```
   This opens Metro Bundler and shows a QR code.

6. **Run it:**
   - **On your phone:** install the **Expo Go** app (App Store / Play Store),
     then scan the QR code.
   - **Android emulator:** press `a` in the terminal.
   - **iOS simulator (Mac only):** press `i`.
   - **Web preview:** press `w` (renders via React Native Web — a stretch
     goal, not required for grading, just handy for a quick look).

> This project was hand-written to match your lecture material and hasn't
> been run through the Expo/Metro bundler in this environment (that needs a
> live device or simulator). Run through the steps above and let me know if
> anything errors — happy to fix it.

## Project structure

```
tourpack-native/
├── App.js                # Screen switcher (signup/signin/dashboard)
├── App.styles.js
├── app.json               # Expo config
├── babel.config.js
├── package.json
└── src/
    ├── theme.js            # Shared colors (RN has no CSS, so this replaces CSS variables)
    └── components/
        ├── UI.js / UI.styles.js                         # PillInput, PillButton, ScreenHeader
        ├── SignUp.js / SignUp.styles.js
        ├── SignIn.js / SignIn.styles.js
        └── ExplorerDashboard.js / ExplorerDashboard.styles.js
```

## How this differs from the web (React) version

| | Web (React) | Mobile (React Native) |
|---|---|---|
| Layout elements | `div`, `p`, `button` | `View`, `Text`, `Pressable` |
| Text input | `<input>` | `<TextInput>` |
| Styling | `.css` files, className | `StyleSheet.create()`, `style={}` prop, no CSS files at all |
| Long lists | `.map()` | `FlatList` (more efficient for longer lists — Lesson 4) |
| Alerts | `window.alert()` | `Alert.alert()` from `react-native` |
| Password field | `type="password"` | `secureTextEntry` prop |
| Keyboard type | n/a | `keyboardType="email-address" / "phone-pad"` |
| Ships as | a website (`npm run dev`) | an installed app (`.apk` / `.ipa`) via Expo Go or a build |

## How it works

- `App.js` holds a single `screen` state (`"signup" | "signin" | "dashboard"`)
  — the same simple pattern as the web version. If you want real back/forward
  navigation and deep linking, this is where you'd swap in **React
  Navigation**'s `NavigationContainer` + `Stack.Navigator` (Lesson 2).
- `SignUp.js` / `SignIn.js` use `useState` for each field (controlled inputs)
  and `Alert.alert()` for validation, matching Lesson 3.
- `ExplorerDashboard.js` filters the sample `PACKAGES` array and renders it
  with `FlatList`, which your notes call out as the recommended component
  for longer lists.
- Every component has its own `*.styles.js` file using `StyleSheet.create()`
  — this is React Native's equivalent of the External CSS approach used in
  the web version, since RN doesn't support `.css` files.

## Next steps if you want to build this out further

- Add **React Navigation** for real screen transitions and a back button.
- Persist the logged-in user with **AsyncStorage** (Lesson 3).
- Replace the sample `PACKAGES` array with data from a real API using
  `fetch()` or **Axios** + `useEffect()` (Lesson 4).

## Firebase Setup (Authentication)

Sign Up and Sign In now use real **Firebase Authentication** instead of
fake local state. Before running the app, you need your own Firebase
project's config values.

1. Go to https://console.firebase.google.com and click **Add project**
   (or open an existing one).
2. Inside the project, click the **"</>"** icon (Web app) to register a web
   app — this is correct even though we're building a mobile app; Firebase's
   JS SDK uses the same config object for both.
3. Skip the "Add Firebase Hosting" checkbox, click **Register app**, and
   copy the `firebaseConfig` object it shows you.
4. Open `src/firebaseConfig.js` in this project and paste your values in,
   replacing the `"YOUR_..."` placeholders.
5. In the Firebase console, go to **Build → Authentication → Get started**,
   then enable the **Email/Password** sign-in provider (it's off by default).

That's it — `npm install` already includes the `firebase` and
`@react-native-async-storage/async-storage` packages needed.

### What changed

- `src/firebaseConfig.js` — connects to your Firebase project and sets up
  `auth` with AsyncStorage persistence, so users stay logged in between app
  restarts.
- `SignUp.js` — calls `createUserWithEmailAndPassword`, then
  `updateProfile` to save the full name (Firebase Auth doesn't have a
  built-in "name" field, so it's stored as `displayName`).
- `SignIn.js` — calls `signInWithEmailAndPassword`.
- `App.js` — uses `onAuthStateChanged` to check if someone's already
  logged in when the app opens (shows a loading spinner briefly while it
  checks), and adds a `handleSignOut` function.
- `ExplorerDashboard.js` — has a **Sign out** button in the top-right,
  wired to that `handleSignOut`.
- Both forms show Firebase's error messages in plain English (e.g. "That
  email is already registered") instead of raw error codes.

### Testing it

Firebase Authentication accounts persist in your Firebase project (Console
→ Authentication → Users), so after signing up once, use **Sign In** with
those same credentials on future app opens — signing up again with the same
email will show "That email is already registered."

## Firestore Setup (Database)

The Explorer Dashboard now loads real data from a **`packages`** collection
in Firestore instead of a hardcoded array.

### If you haven't already:

1. In the Firebase console, go to **Build → Firestore Database → Create database**.
2. Start in **test mode** for now (locks down automatically after 30 days —
   fine for coursework, not for a real production app).
3. Click **Start collection**, name it `packages`, and add a document with
   these fields for each tour package:

   | Field | Type | Example |
   |---|---|---|
   | `name` | string | `Kawasan Falls Canyoneering` |
   | `guide` | string | `Janine Bongon` |
   | `toursGuided` | number | `900` |
   | `date` | string | `September 20, 2026` |
   | `duration` | string | `Full day` |
   | `pax` | number | `30` |
   | `price` | number | `2000` |

No config changes needed in the app itself — `src/firebaseConfig.js`
already exports a `db` (Firestore) instance alongside `auth`, using the
same project config you already set up for Authentication.

### What changed

- `src/firebaseConfig.js` — added `getFirestore(app)`, exported as `db`.
- `ExplorerDashboard.js` — on mount, calls `getDocs(collection(db,
  "packages"))` (same `useEffect` + `useState` + `try/catch` pattern from
  Lesson 4) and stores the results in state instead of using the old
  hardcoded `PACKAGES` array. Shows an `ActivityIndicator` while loading,
  and a message if the collection is empty or the fetch fails.

### If the list stays empty

- Double-check the collection is literally named `packages` (case-sensitive).
- Make sure Firestore is in **test mode**, or your security rules allow
  reads — a locked-down database will fail the fetch silently into the
  error message instead of a list.
