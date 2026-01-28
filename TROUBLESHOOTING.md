# Troubleshooting Login Issues

## Quick Fix for Login Not Working

### Issue: Can't login or see blank page

### Solution Steps:

#### Step 1: Clear Browser Data
Open browser console (F12 or Ctrl+Shift+I / Cmd+Option+I) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### Step 2: Check Console for Errors
1. Open browser console (F12)
2. Go to "Console" tab
3. Look for red error messages
4. Share the error with me if you see any

#### Step 3: Verify Server is Running
The app should be running at: http://localhost:3000

If not running:
```bash
npm start
```

#### Step 4: Hard Refresh
- Chrome/Edge: Ctrl+Shift+R (Cmd+Shift+R on Mac)
- Firefox: Ctrl+F5 (Cmd+Shift+R on Mac)
- Safari: Cmd+Option+R

---

## Common Issues & Fixes

### 1. "Cannot read property of undefined"

**Fix**: Clear localStorage and refresh
```javascript
localStorage.clear();
location.reload();
```

### 2. Blank White Screen

**Fix**: Check browser console for errors
- Look for "Module not found" errors
- Look for "Cannot find" errors

### 3. Login Button Does Nothing

**Check**:
1. Are you on http://localhost:3000 (not https)?
2. Is the console showing any errors?
3. Try the "Try Demo Account" button instead

### 4. Stuck on Loading Screen

**Fix**: The app might be waiting for data
```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Force reload
window.location.href = '/login';
```

---

## Debug Mode

### Check Authentication State
```javascript
// Run in browser console
console.log('isLoggedIn:', localStorage.getItem('isLoggedIn'));
console.log('user:', localStorage.getItem('user'));
console.log('cards:', localStorage.getItem('cards'));
```

### Force Login State
```javascript
// Force set logged in state
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('user', JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
  creditScore: 750
}));
location.reload();
```

### Reset Everything
```javascript
// Complete reset
localStorage.clear();
sessionStorage.clear();
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});
location.href = '/';
```

---

## Testing Login Functionality

### Test 1: Demo Account
1. Go to http://localhost:3000
2. Should see login page
3. Click "Try Demo Account"
4. Should redirect to dashboard

### Test 2: Sign Up
1. Click "Sign Up" tab
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Click "Create Account"
4. Should redirect to dashboard

### Test 3: Login
1. If you created account above
2. Logout (click 🚪 in sidebar)
3. Enter:
   - Email: test@example.com
   - Password: test123
4. Click "Login"
5. Should see dashboard

---

## Current Configuration

The app uses:
- **Login Component**: `src/components/Login.js` (localStorage based)
- **Storage**: localStorage (browser storage)
- **Routes**: `/login`, `/dashboard`, `/cards`, `/expenses`

---

## If Nothing Works

### Complete Fresh Start

1. **Stop the server** (Ctrl+C in terminal)

2. **Clear everything**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

3. **Clear browser completely**:
   - Open Incognito/Private window
   - Or clear all site data in browser settings

4. **Restart**:
```bash
npm start
```

5. **Open fresh**: http://localhost:3000

---

## Get Help

If still having issues, please share:

1. **Error messages** from browser console
2. **Screenshot** of what you see
3. **Browser** you're using (Chrome, Firefox, Safari, etc.)
4. **Steps** you've tried from above

I'll help diagnose and fix the specific issue!
