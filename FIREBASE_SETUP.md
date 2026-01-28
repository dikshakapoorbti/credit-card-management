# Firebase Setup Guide

## Complete Step-by-Step Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `credit-card-manager` (or your preferred name)
4. Click **Continue**
5. Disable Google Analytics (optional, you can enable later)
6. Click **Create project**
7. Wait for setup to complete, then click **Continue**

### 2. Enable Authentication

1. In the Firebase Console, click **"Authentication"** from the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Google** sign-in:
   - Click on **Google**
   - Toggle **Enable**
   - Enter your project support email
   - Click **Save**
5. (Optional) Enable **Email/Password** sign-in:
   - Click on **Email/Password**
   - Toggle **Enable**
   - Click **Save**

### 3. Create Firestore Database

1. Click **"Firestore Database"** from the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   ```
   Test mode rules (automatically set):
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 2, 1);
       }
     }
   }
   ```
4. Select **Cloud Firestore location** (choose closest to you)
5. Click **Enable**
6. Wait for database creation

### 4. Get Firebase Configuration

1. Click on **⚙️ Project Settings** (gear icon next to "Project Overview")
2. Scroll down to **"Your apps"** section
3. Click on **</>** (Web icon) to add a web app
4. Enter app nickname: `CardManager Web`
5. Check ✅ **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. **Copy the Firebase configuration**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcd..."
   };
   ```

### 5. Configure Your App

1. **Create `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Open `.env`** and paste your Firebase config:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSy...
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcd...
   ```

3. **Save the file**

### 6. Update Security Rules (Important!)

For production, update Firestore security rules:

1. Go to **Firestore Database** > **Rules** tab
2. Replace with these rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // User profiles
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;

         // User's cards
         match /cards/{cardId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }

         // User's expenses
         match /expenses/{expenseId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```
3. Click **Publish**

### 7. Test Your Setup

1. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm start
   ```

2. **Clear browser data**:
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   ```

3. **Refresh the page** - You should see the login screen

4. **Click "Sign in with Google"**:
   - Choose your Google account
   - Grant permissions
   - You should be redirected to the dashboard!

### 8. Verify Data in Firestore

1. Go to **Firestore Database** in Firebase Console
2. You should see collections created:
   - `/users/{userId}`
   - `/users/{userId}/cards`
   - `/users/{userId}/expenses`

---

## Using the App with Firebase

### Features Now Available:

1. ✅ **Google Sign-In**
   - One-click authentication
   - Profile picture from Google account
   - No password to remember

2. ✅ **Cloud Data Sync**
   - Cards sync across devices
   - Expenses sync across devices
   - Access from phone, tablet, laptop

3. ✅ **Automatic Backup**
   - Data safely stored in cloud
   - Never lose your data

4. ✅ **Secure Access**
   - Only you can see your data
   - Firestore security rules protect your info

---

## Switching Between localStorage and Firebase

### Use Firebase (Cloud Sync):
- Import `LoginWithFirebase` in App.js
- Data syncs across devices
- Requires internet connection

### Use localStorage (Offline):
- Import regular `Login` in App.js
- Works completely offline
- Data stays on device

**Current Setup**: App supports both! Switch by changing the import in App.js.

---

## Logo Setup

### Adding Your Custom Logo

1. **Prepare your logo**:
   - Format: PNG (recommended) or SVG
   - Dimensions: 200x200px or higher (square)
   - File name: `credit-card-logo.png`

2. **Place logo file**:
   ```bash
   # Copy your logo to:
   src/assets/credit-card-logo.png
   ```

3. **Logo will automatically appear**:
   - Login page (top of card)
   - Sidebar (top navigation)
   - Browser tab (favicon)

### Using SVG Logo

If you have an SVG logo:
1. Rename it to `credit-card-logo.svg`
2. Update imports in:
   - `src/App.js` (line 8)
   - `src/components/LoginWithFirebase.js` (line 3)
   ```javascript
   import logo from './assets/credit-card-logo.svg';
   ```

---

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"

**Fix**:
1. Go to Firebase Console > **Authentication** > **Settings** tab
2. Scroll to **Authorized domains**
3. Add your domain (e.g., `localhost`)
4. Click **Add domain**

### "Permission denied" errors

**Fix**:
1. Check Firestore security rules (see Step 6)
2. Make sure you're signed in
3. Verify `request.auth.uid` matches user ID

### Google Sign-In not working

**Fix**:
1. Verify Google sign-in is **enabled** in Firebase Console
2. Check if `.env` file exists and has correct values
3. Restart development server after changing `.env`
4. Clear browser cache and try again

### Can't see data in Firestore

**Fix**:
1. Check browser console for errors
2. Verify Firebase config in `.env`
3. Check Firestore security rules
4. Make sure internet connection is active

---

## API Security

The app includes security features:

1. **Authentication Tokens**:
   - Stored securely
   - Sent with all API requests
   - Auto-renewal

2. **Request Interceptors**:
   - Adds auth headers automatically
   - Handles token expiration
   - Redirects to login if unauthorized

3. **Firebase Security Rules**:
   - User can only access their own data
   - Server-side validation
   - Prevents unauthorized access

---

## Next Steps

1. ✅ Firebase setup complete
2. ✅ Google Sign-In working
3. ✅ Data syncing to cloud
4. ✅ Security rules in place

Now you can:
- Access your cards from any device
- Share with family (add them as users)
- Never lose your data
- Use Google account for easy login

Enjoy your upgraded CardManager app! 🎉
