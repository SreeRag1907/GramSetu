# 🔥 Firebase Setup Required!

You're seeing the "invalid-api-key" error because Firebase credentials are not configured.

## Quick Fix (2 minutes):

### Option 1: Direct Edit (Fastest)

1. Open: `admin-panel/src/firebase.ts`
2. Replace the placeholder values with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",      // ← Replace this
  authDomain: "gramsetu-xxxxx.firebaseapp.com",          // ← Replace this
  projectId: "gramsetu-xxxxx",                           // ← Replace this
  storageBucket: "gramsetu-xxxxx.appspot.com",          // ← Replace this
  messagingSenderId: "123456789012",                     // ← Replace this
  appId: "1:123456789012:web:abcdefghijklmnop",         // ← Replace this
};
```

### Where to Get Firebase Credentials?

1. Go to https://console.firebase.google.com
2. Select your **GramSetu** project
3. Click ⚙️ (Settings icon) → **Project settings**
4. Scroll down to "Your apps" section
5. If you don't see a web app:
   - Click "</> Web" button
   - Register app with name "GramSetu Admin"
   - Copy the config values
6. If you already have a web app, click it and copy the config

### Option 2: Use .env File

1. Create `.env` file in `admin-panel/` folder
2. Add this content (with your actual values):

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=gramsetu-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gramsetu-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=gramsetu-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

3. Restart the dev server: `npm run dev`

## After Fixing:

1. Refresh the browser
2. You should see the login page without errors
3. Create admin account in Firebase Authentication
4. Login and start managing schemes!

## Still Having Issues?

Check the browser console (F12) for detailed error messages.
