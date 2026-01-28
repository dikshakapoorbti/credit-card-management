# Firebase Authentication Setup Guide

## Enable Email/Password Authentication

Your application now uses Firebase Authentication to manage user accounts. Follow these steps to enable it:

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **credit-card-manager-new**

### Step 2: Enable Email/Password Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get Started** (if this is your first time) or click the **Sign-in method** tab
3. Under **Native providers**, find **Email/Password**
4. Click on it to open the configuration
5. Toggle the **Enable** switch to ON
6. Click **Save**

### Step 3: (Optional) Enable Email Link Sign-in

You can also enable passwordless sign-in:
1. In the same Email/Password section
2. Toggle **Email link (passwordless sign-in)** to ON (optional)
3. Click **Save**

---

## How It Works Now

### Sign Up Flow

1. **User fills signup form** with name, email, and password
2. **Firebase creates authentication account** in Firebase Auth
3. **User profile saved to Firestore** at `/users/{uid}` with:
   ```json
   {
     "uid": "user-unique-id",
     "name": "User Name",
     "email": "user@example.com",
     "memberSince": "2024-12-22",
     "creditScore": 750,
     "createdAt": "2024-12-22T10:30:00.000Z"
   }
   ```
4. **User logged in automatically** and redirected to dashboard

### Login Flow

1. **User enters email and password**
2. **Firebase verifies credentials** against Firebase Auth
3. **User profile fetched from Firestore** at `/users/{uid}`
4. **User logged in** and redirected to dashboard

### Data Storage Structure

```
Firestore Database
├── users/
│   ├── {userId}/
│   │   ├── (user profile data)
│   │   ├── cards/
│   │   │   ├── {cardId}/
│   │   │   │   └── (card data)
│   │   └── expenses/
│   │       └── {expenseId}/
│   │           └── (expense data)
```

---

## Testing Authentication

### Test Signup

1. Go to http://localhost:3000
2. Click **Sign Up** tab
3. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
4. Click **Create Account**
5. You should be redirected to dashboard
6. Check Firebase Console → Authentication → Users to see the new user

### Test Login

1. Logout from the app
2. Go to login page
3. Enter:
   - Email: test@example.com
   - Password: test123
4. Click **Login**
5. You should be redirected to dashboard

### View User Data in Firestore

1. Go to Firebase Console
2. Click **Build** → **Firestore Database**
3. Navigate to: `users` → `{userId}` to see the user profile
4. You'll see all user data stored there

---

## Error Handling

The app now handles Firebase-specific errors:

- **Email already in use**: "Email already in use. Please login instead."
- **Invalid email**: "Invalid email address."
- **Weak password**: "Password is too weak. Please use at least 6 characters."
- **User not found**: "No account found. Please sign up first."
- **Wrong password**: "Invalid email or password."
- **Invalid credentials**: "Invalid email or password."
- **Other errors**: "Authentication failed. Please try again."

---

## Security Features

### Password Requirements
- Minimum 6 characters (Firebase default)
- Can be increased in Firebase Console → Authentication → Settings

### Security Rules (Recommended)

Add these rules to Firestore to secure user data:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Users can only access their own cards
      match /cards/{cardId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Users can only access their own expenses
      match /expenses/{expenseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **Publish**

---

## Migration from localStorage

If you have existing users in localStorage, they need to:

1. **Sign up** with the same email to create Firebase account
2. Their data will be stored in Firebase
3. Old localStorage data can be manually migrated or cleared

---

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
**Solution**: Enable Email/Password authentication in Firebase Console

### Error: "Firebase: Error (auth/network-request-failed)"
**Solution**: Check your internet connection and Firebase configuration

### Error: "User profile not found"
**Solution**: The user exists in Auth but not in Firestore. Delete the user from Firebase Auth and sign up again.

### Check Firebase Configuration
```javascript
// In browser console
console.log('Firebase Config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});
```

---

## Next Steps

1. ✅ Enable Email/Password authentication in Firebase Console
2. ✅ Test signup with a new user
3. ✅ Test login with the same user
4. ✅ Add Firestore security rules
5. ✅ (Optional) Enable Google Sign-In for additional login option

---

## Additional Features to Add

### Email Verification (Recommended)
```javascript
import { sendEmailVerification } from 'firebase/auth';

// After signup
await sendEmailVerification(user);
```

### Password Reset
```javascript
import { sendPasswordResetEmail } from 'firebase/auth';

await sendPasswordResetEmail(auth, email);
```

### Update Profile
```javascript
import { updateProfile } from 'firebase/auth';

await updateProfile(auth.currentUser, {
  displayName: "New Name",
  photoURL: "https://example.com/photo.jpg"
});
```

---

## Support

If you encounter any issues:
1. Check Firebase Console for error logs
2. Check browser console for detailed errors
3. Verify .env file has correct Firebase credentials
4. Ensure Firebase services are enabled in Console
