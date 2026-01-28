# Quick Deployment Guide

## Prerequisites
- Node.js 14+ installed
- Firebase account created
- Project cloned/downloaded

## Step-by-Step Deployment

### 1. Install Dependencies
```bash
npm install
npm install -g firebase-tools
```

### 2. Firebase Project Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Firestore
# - Hosting
# - Storage

# Use existing files:
# - firestore.rules
# - storage.rules
# - build as public directory
```

### 3. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Edit .env with your Firebase config from Firebase Console
```

### 4. Deploy Security Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

### 5. Build and Deploy App
```bash
# Build React app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 6. Post-Deployment

1. **Configure Authorized Domains**
   - Go to Firebase Console → Authentication → Settings
   - Add your deployment URL to authorized domains

2. **Enable App Check** (Recommended)
   - Go to Firebase Console → App Check
   - Register web app with reCAPTCHA v3

3. **Test the Application**
   - Visit your deployed URL
   - Create a test account
   - Add sample card and expense
   - Verify data is saved in Firestore Console

## Environment Variables

Required in `.env` file:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

Get these values from:
Firebase Console → Project Settings → Your apps → Web app

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Permission Denied Errors
- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Verify user is authenticated
- Check browser console for detailed error messages

### Data Not Saving
- Verify Firebase config in `.env`
- Check Network tab in browser DevTools
- Review Firestore Console for security rule violations

## Support

For detailed security setup, see [FIRESTORE_SECURITY_GUIDE.md](./FIRESTORE_SECURITY_GUIDE.md)
