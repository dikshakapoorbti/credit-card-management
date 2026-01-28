# Troubleshooting Firebase Authentication Error

## Error You're Seeing

```
FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## What This Means

This error occurs when:
1. The Firebase API key is not being loaded from the `.env` file
2. The Firebase API key is invalid
3. Email/Password authentication is not enabled in Firebase Console

## Solution Steps

### ✅ Step 1: Server Restart (COMPLETED)

The development server has been restarted to load the `.env` file variables.

### Step 2: Verify Environment Variables Are Loaded

1. Open browser at http://localhost:3000
2. Open browser console (F12 or Cmd+Option+I)
3. Run this command:

```javascript
console.log({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});
```

**Expected output:**
```javascript
{
  apiKey: "AIzaSyCJ-kV9G7ZQVY8VP9eaiisBWh4f-jwbJ20",
  authDomain: "credit-card-manager-new.firebaseapp.com",
  projectId: "credit-card-manager-new"
}
```

**If you see `undefined`:**
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Make sure the `.env` file is in the root directory (same level as `package.json`)
- The server restart should have fixed this

### Step 3: Enable Email/Password Authentication in Firebase Console

This is the **MOST IMPORTANT** step:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **credit-card-manager-new**
3. Click **Build** → **Authentication** in the left sidebar
4. Click **Get Started** (if first time) or **Sign-in method** tab
5. Under **Native providers**, find **Email/Password**
6. Click on it to expand
7. Toggle **Enable** switch to ON
8. Click **Save**

**Screenshot guide:**
```
Firebase Console
└── credit-card-manager-new (your project)
    └── Build
        └── Authentication
            └── Sign-in method tab
                └── Native providers
                    └── Email/Password [Toggle ON]
```

### Step 4: Test Again

After enabling Email/Password authentication:

1. Go to http://localhost:3000
2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Click **Sign Up** tab
5. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
6. Click **Create Account**

### Step 5: Verify in Firebase Console

After successful signup:

1. Go to Firebase Console → Authentication → Users
2. You should see the new user listed with email: test@example.com
3. Go to Firestore Database → users → {userId}
4. You should see the user profile data

---

## Additional Checks

### Check .env File Location

The `.env` file MUST be in the project root:

```
/Users/dikshakapoor/Desktop/credit-card-management/
├── .env                    ← HERE (same level as package.json)
├── package.json
├── src/
├── public/
└── ...
```

### Verify .env File Contents

Your `.env` file should have these exact lines:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyCJ-kV9G7ZQVY8VP9eaiisBWh4f-jwbJ20
REACT_APP_FIREBASE_AUTH_DOMAIN=credit-card-manager-new.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=credit-card-manager-new
REACT_APP_FIREBASE_STORAGE_BUCKET=credit-card-manager-new.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1060006851554
REACT_APP_FIREBASE_APP_ID=1:1060006851554:web:7b8dcaf2f83e4967e97fbb
```

**Important:**
- No spaces around `=`
- No quotes around values
- Each variable starts with `REACT_APP_`

### Test Firebase Configuration in Browser Console

Open browser console and run:

```javascript
// Check if Firebase is initialized
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Firebase Auth initialized:', auth);
```

Or add this temporarily to `src/config/firebase.js` after the `initializeApp` call:

```javascript
console.log('Firebase Config Loaded:', {
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});
```

---

## Common Issues & Solutions

### Issue 1: "API key not valid"
**Cause**: Environment variables not loaded or Email/Password auth not enabled
**Solution**:
- ✅ Server restarted (done)
- Enable Email/Password in Firebase Console (see Step 3 above)

### Issue 2: No entry in Firestore
**Cause**: Signup failed before reaching Firestore
**Solution**:
- Fix the API key issue first
- Enable Email/Password authentication
- Then signup will work and create Firestore entry

### Issue 3: Variables showing as undefined
**Cause**: .env file not in correct location or server not restarted
**Solution**:
- ✅ Server restarted (done)
- Verify .env is in root directory
- Hard refresh browser

---

## Quick Checklist

- ✅ `.env` file exists in root directory
- ✅ `.env` has correct Firebase credentials
- ✅ Development server restarted (npm start)
- ⏳ **Email/Password authentication enabled in Firebase Console** ← DO THIS NOW
- ⏳ Browser hard refreshed
- ⏳ Test signup again

---

## After Enabling Authentication

Once you enable Email/Password authentication in Firebase Console:

1. **No code changes needed** - everything is already configured
2. **Just try signup again** - it should work immediately
3. **Check Firebase Console** - you'll see the new user in Authentication → Users
4. **Check Firestore** - you'll see user profile in Firestore Database → users → {userId}

---

## Still Having Issues?

If it still doesn't work after enabling Email/Password authentication:

1. Share the browser console error (F12 → Console tab)
2. Check Firebase Console → Authentication → Users (is it empty?)
3. Check if you can see your project settings in Firebase Console
4. Verify your Firebase project is active and not disabled

The most common cause is **Email/Password authentication not being enabled** in Firebase Console. Please enable it first!
