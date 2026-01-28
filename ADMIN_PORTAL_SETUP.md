# Admin Portal Setup Guide

## Overview

The Admin Portal is a complete no-code/low-code interface that allows authorized administrators to manage credit cards, offers, and system settings without writing any code.

---

## Features

### Admin Portal Capabilities:
- **Admin Authentication** - Separate login for admin users
- **Card Management** - Add, edit, delete credit cards
- **Offer Management** - Create and manage cashback/rewards offers
- **Dashboard Analytics** - View system statistics
- **User Management** - (Coming soon)
- **Analytics** - (Coming soon)

---

## Setting Up Admin Access

### Step 1: Create Admin User Account

1. **Sign up normally** through the user registration page
2. **Get your User ID** from Firebase Console:
   - Go to Firebase Console: https://console.firebase.google.com/
   - Select your project: `credit-card-manager-new`
   - Navigate to **Firestore Database**
   - Open the `users` collection
   - Find your user document and copy the **Document ID**

### Step 2: Grant Admin Privileges

In Firebase Firestore, add the `isAdmin` field to your user document:

```javascript
// Your user document should look like this:
{
  name: "Your Name",
  email: "admin@example.com",
  creditScore: 750,
  isAdmin: true  // <-- Add this field
}
```

**How to add this field:**
1. Go to Firestore Database in Firebase Console
2. Click on your user document in the `users` collection
3. Click "Add field"
4. Field name: `isAdmin`
5. Type: `boolean`
6. Value: `true`
7. Click "Update"

---

## Accessing the Admin Portal

### Admin Login URL:
```
http://localhost:3000/admin/login
```

### Admin Credentials:
- Use the same email and password you created during sign-up
- The system will check for the `isAdmin: true` flag in your Firestore user document

### Admin Routes:
- `/admin/login` - Admin authentication page
- `/admin/dashboard` - Admin dashboard with stats
- `/admin/cards` - Manage credit cards
- `/admin/offers` - Manage offers (Coming soon)
- `/admin/users` - View users (Coming soon)
- `/admin/analytics` - Analytics dashboard (Coming soon)

---

## Using the Admin Portal

### 1. Admin Dashboard

After logging in, you'll see:
- **Statistics Cards:**
  - Total Users
  - Total Credit Cards
  - Total Expenses Tracked
  - Total Reviews

- **Quick Actions:**
  - Add New Card
  - Create Offer
  - View Users
  - View Analytics

- **Navigation Sidebar:**
  - Dashboard
  - Manage Cards
  - Manage Offers
  - Users
  - Analytics
  - Logout
  - View User App (switch to user view)

### 2. Card Management (`/admin/cards`)

**Add New Card:**

Click "Add New Card" button and fill in the form:

**Basic Information:**
- Card Name (e.g., "HDFC Regalia")
- Bank Name (e.g., "HDFC Bank")
- Card Type (Credit/Debit)
- Card Color Theme (6 gradient options)

**Rewards Settings:**
- Rewards Type (Reward Points/Cashback/Airline Miles)
- Base Points per ₹100 spent

**Card Benefits:**
- Add multiple benefits (e.g., "Airport lounge access")
- Click "+ Add Benefit" for more

**Offers & Cashback:**
For each offer, specify:
- Category (Dining, Travel, Shopping, etc.)
- Cashback Percentage (%)
- Reward Points Multiplier (X points)
- Max Benefit (₹) - Leave empty for unlimited
- Min Transaction (₹)
- Valid Till (date)
- Description (e.g., "5% cashback on dining")
- Terms & Conditions

**Multiple Offers:**
- Click "+ Add Offer" to create multiple category-specific offers
- Each card can have unlimited offers

**Example Card Setup:**
```
Card Name: HDFC Regalia
Bank Name: HDFC Bank
Card Type: Credit
Color: Purple Gradient
Rewards Type: Reward Points
Base Points: 4

Benefits:
- Airport lounge access (6 per year)
- Fuel surcharge waiver
- 1% cashback on all spends

Offers:
1. Category: Dining
   Cashback: 0%
   Points Multiplier: 10X
   Max Benefit: ₹1500
   Min Transaction: ₹500
   Description: 10X reward points on dining

2. Category: Travel
   Cashback: 0%
   Points Multiplier: 6X
   Max Benefit: ₹5000
   Min Transaction: ₹1000
   Description: 6X reward points on travel
```

**View All Cards:**
- Grid view of all credit cards in the system
- See card preview, type, rewards type, offer count
- Edit or delete any card

**Edit Card:**
- Click "Edit" button on any card
- Form pre-fills with existing data
- Make changes and click "Update Card"

**Delete Card:**
- Click "Delete" button
- Confirm deletion
- Card removed from system

---

## Data Storage

All admin changes are saved to Firebase Firestore in real-time:

### Collections:
- `/creditCards/` - All credit cards added by admins
- `/users/` - User accounts (includes admin flag)

### Card Document Structure:
```javascript
{
  cardName: "HDFC Regalia",
  bankName: "HDFC Bank",
  cardType: "Credit",
  color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  benefits: [
    "Airport lounge access",
    "Fuel surcharge waiver"
  ],
  rewards: {
    type: "Reward Points",
    pointsPerRupee: 4,
    categories: {
      "Dining": 10,
      "Travel": 6
    }
  },
  offers: [
    {
      id: "offer1234",
      category: "Dining",
      cashbackPercent: 0,
      rewardPointsMultiplier: 10,
      maxBenefit: 1500,
      minTransaction: 500,
      description: "10X reward points on dining",
      validTill: "2025-12-31",
      terms: "Valid on select partner restaurants"
    }
  ],
  createdAt: "2025-12-23T10:30:00.000Z",
  isActive: true
}
```

---

## Security

### Admin Authentication:
- Admin users must have `isAdmin: true` in their Firestore user document
- Regular users cannot access admin routes even if they know the URL
- Admin session stored in localStorage
- Admin routes protected with authentication checks

### Best Practices:
1. Only grant admin access to trusted users
2. Use strong passwords for admin accounts
3. Regularly audit admin users in Firestore
4. Monitor admin activity through Firebase Console

---

## Troubleshooting

### Cannot Login to Admin Portal:
1. Check if `isAdmin: true` is set in your Firestore user document
2. Clear browser cache and localStorage
3. Try logging out and logging back in
4. Check Firebase Console for authentication errors

### Cards Not Showing:
1. Check Firebase Firestore rules allow read access to `/creditCards/`
2. Check browser console for errors
3. Verify cards were saved successfully in Firestore

### Offers Not Working:
1. Ensure offers have valid category names
2. Check that either `cashbackPercent` or `rewardPointsMultiplier` is set
3. Verify `validTill` date is in the future
4. Check that `minTransaction` is less than user's purchase amount

---

## Admin Portal Files

### Components:
- `src/admin/AdminLogin.js` - Admin authentication page
- `src/admin/AdminLogin.css` - Admin login styles
- `src/admin/AdminDashboard.js` - Admin dashboard with routing
- `src/admin/AdminDashboard.css` - Admin dashboard styles
- `src/admin/CardManagement.js` - Card CRUD interface
- `src/admin/CardManagement.css` - Card management styles

### Routes (in App.js):
```javascript
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/*" element={<AdminDashboard />} />
```

---

## Future Enhancements

### Planned Features:
1. **Offer Rules Engine** - Create complex offer rules (if-then conditions)
2. **User Management** - View, edit, suspend user accounts
3. **Analytics Dashboard** - Detailed charts and reports
4. **Bulk Import** - Upload CSV to add multiple cards
5. **Card Images** - Upload custom card images
6. **Approval Workflow** - Review before publishing cards
7. **Scheduling** - Schedule offers to activate automatically
8. **A/B Testing** - Test different offer configurations
9. **Email Notifications** - Notify users of new offers
10. **Audit Logs** - Track all admin actions

---

## Support

For issues or questions about the admin portal:
1. Check Firebase Console for errors
2. Review browser console logs
3. Verify Firestore security rules
4. Check network requests in browser DevTools

---

## Quick Start Checklist

- [ ] Sign up for a new account through user registration
- [ ] Get your User ID from Firebase Firestore
- [ ] Add `isAdmin: true` to your user document
- [ ] Navigate to `/admin/login`
- [ ] Login with your email and password
- [ ] Add your first credit card
- [ ] Create offers for different categories
- [ ] Test recommendations in the user app

---

## Summary

The Admin Portal provides a complete no-code interface for managing credit cards and offers. Admins can:

✅ Add credit cards with full details
✅ Create category-specific cashback/rewards offers
✅ Set offer validity periods and conditions
✅ Edit or delete existing cards
✅ View system statistics
✅ Switch between admin and user views

All changes are saved to Firebase Firestore in real-time and immediately available to users through the recommendation engine.
