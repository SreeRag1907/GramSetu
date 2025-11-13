# GramSetu Production Build Instructions

## Prerequisites for Production Build

### 1. Firebase Configuration (CRITICAL)

Before building for production, you **MUST** configure Firebase credentials:

1. Create a `.env.local` file in the project root (copy from `.env.example`)
2. Fill in your actual Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**How to get Firebase credentials:**
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project
- Go to Project Settings → General → Your apps
- Copy the config values from your web app

### 2. EAS Build Configuration

Ensure you're logged in to Expo:
```bash
npx eas-cli login
```

### 3. Build Commands

#### Preview Build (APK for testing)
```bash
npx eas build --platform android --profile preview
```

#### Production Build
```bash
npx eas build --platform android --profile production
```

## Common Issues & Solutions

### Issue: App crashes after "Continue to Login"

**Cause:** Missing or invalid Firebase credentials in production build

**Solution:**
1. Ensure `.env.local` exists with valid credentials
2. Rebuild the app after adding credentials
3. Check Firebase Console that the project is active

### Issue: "Firebase not initialized" error

**Cause:** Environment variables not being loaded in production

**Solution:**
1. For EAS builds, add secrets to EAS:
```bash
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value your_value
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value your_value
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value your_value
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value your_value
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value your_value
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_APP_ID --value your_value
```

2. Or add to `eas.json`:
```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "your_key",
        ...
      }
    }
  }
}
```

### Issue: Network errors in production

**Cause:** Android security policies blocking HTTP traffic

**Solution:** Already configured in `app.json`:
- `usesCleartextTraffic: true`
- `networkSecurityConfig` set

## Testing Production Build

1. Install the APK on a physical device
2. Test the complete flow:
   - Language selection
   - Get Started screen
   - Login/Registration
   - Firebase operations
3. Check logs with:
```bash
adb logcat | grep -i firebase
```

## Recommended: Use EAS Secrets for Production

For production builds, never commit `.env.local` to git. Instead:

1. Add secrets to EAS (one-time setup):
```bash
npx eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your_actual_key"
```

2. Reference them in `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_FIREBASE_API_KEY": "${EXPO_PUBLIC_FIREBASE_API_KEY}"
      }
    }
  }
}
```

## Build Checklist

Before running production build:

- [ ] Firebase credentials configured (`.env.local` or EAS secrets)
- [ ] Test Firebase connection in development
- [ ] All duplicate key warnings fixed
- [ ] Test complete user flow
- [ ] Version number updated in `app.json`
- [ ] Icon and splash screen configured
- [ ] Network permissions configured

## Next Steps After Successful Build

1. Download APK from EAS dashboard
2. Test on multiple devices
3. Submit to Google Play Store (if ready)
