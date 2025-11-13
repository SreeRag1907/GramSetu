# 🚀 Quick Start Guide - GramSetu Admin Panel

## Step 1: Install Dependencies (2 minutes)

```bash
cd admin-panel
npm install
```

## Step 2: Configure Environment (2 minutes)

Copy your Firebase config from the mobile app:

1. Create `.env` file in `admin-panel` folder
2. Copy this template and fill in your values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Where to find these?**
- Check your `services/firebaseConfig.ts` file in the mobile app
- OR Firebase Console → Project Settings → General → Your apps

## Step 3: Create Admin Account (1 minute)

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your GramSetu project
3. Click "Authentication" in left sidebar
4. Click "Users" tab
5. Click "Add User" button
6. Enter:
   - Email: `admin@gramsetu.gov.in`
   - Password: `admin123`
7. Click "Add User"

## Step 4: Update Firestore Rules (1 minute)

1. Go to Firebase Console → Firestore Database
2. Click "Rules" tab
3. Add these rules:

```javascript
match /government_schemes/{schemeId} {
  allow read: if true;
  allow write: if request.auth != null;
}

match /scheme_applications/{applicationId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null;
  allow update: if request.auth != null;
  allow delete: if request.auth != null;
}
```

4. Click "Publish"

## Step 5: Run the Admin Panel (1 minute)

```bash
npm run dev
```

Browser will open at http://localhost:3000

## Step 6: Login & Start Managing! 🎉

**Login Credentials:**
- Email: `admin@gramsetu.gov.in`
- Password: `admin123`

**First Steps:**
1. Go to **Schemes** tab
2. Click **"Add New Scheme"**
3. Fill scheme details
4. Click **"Add Scheme"**
5. Scheme will appear in mobile app instantly! ✅

---

## 🔥 Quick Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✅ Checklist

- [ ] Installed Node.js 18+
- [ ] Ran `npm install`
- [ ] Created `.env` file with Firebase credentials
- [ ] Created admin user in Firebase Authentication
- [ ] Updated Firestore security rules
- [ ] Ran `npm run dev`
- [ ] Logged in successfully
- [ ] Added first scheme

---

## 🆘 Common Issues & Solutions

### Issue: "Firebase: Error (auth/invalid-email)"
**Solution**: Check admin email format in Firebase Authentication

### Issue: "Permission denied" when adding scheme
**Solution**: Verify Firestore rules are published and admin is logged in

### Issue: Admin panel won't start
**Solution**: 
1. Check Node.js version: `node --version` (should be 18+)
2. Delete `node_modules` and run `npm install` again
3. Check `.env` file exists and has correct values

### Issue: Can't see mobile app data
**Solution**: Ensure you're using the SAME Firebase project for both mobile app and admin panel

---

## 📚 What's Next?

1. **Add More Schemes**: Go to Schemes tab and create all government schemes
2. **Review Applications**: When farmers apply, go to Applications tab
3. **Approve/Reject**: Click "Review" on any application
4. **Track Statistics**: Dashboard shows real-time stats

---

## 💡 Pro Tips

- Keep admin panel open in one tab while testing mobile app in another
- Use search and filters in Applications page for faster review
- Add detailed remarks when approving/rejecting for farmer clarity
- Update scheme status to "Expired" when deadline passes
- Use the same category icons for consistency

---

**Need Help?** Check the full README.md for detailed documentation!
