# Future Tasks & Enhancements

## Overview
This document consolidates all pending tasks and future enhancements from all project documentation files. Tasks are organized by priority and category.

---

## High Priority Tasks (User-Requested)

### 1. Fix User Profile Email Overflow ⚠️
**Status**: Pending
**Priority**: High
**Location**: Navigation sidebar (`src/App.js` and `src/App.css`)

**Issue**: Long email addresses overflow the user profile container in the sidebar.

**Solution**:
- Add `overflow: hidden` and `text-overflow: ellipsis` to email display
- Consider showing tooltip with full email on hover
- Test with various email lengths

**Files to Modify**:
- `src/App.css` - Add CSS for `.user-info p` or `.user-profile`

**Example Fix**:
```css
.user-info p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
```

---

### 2. Integrate AppTour Component 🎯
**Status**: Component created, needs integration
**Priority**: High
**Files Created**:
- `src/components/AppTour.js` ✅
- `src/components/AppTour.css` ✅

**Remaining Work**:
1. **Detect First-Time Users**
   - Add `hasSeenTour` flag in user profile (Firestore)
   - Check on app load
   - Show tour if flag is false

2. **Integrate into App.js**
   ```javascript
   // In AppContent component
   const [showTour, setShowTour] = useState(false);

   useEffect(() => {
     if (user && !user.hasSeenTour) {
       setShowTour(true);
     }
   }, [user]);

   const handleTourComplete = async () => {
     setShowTour(false);
     await updateUserProfile(user.uid, { hasSeenTour: true });
   };

   return (
     <>
       {showTour && <AppTour onComplete={handleTourComplete} />}
       {/* Rest of app */}
     </>
   );
   ```

3. **Update User Profile Schema**
   - Add `hasSeenTour: boolean` field to user documents
   - Update Firestore security rules to allow this field

4. **Add "Show Tour Again" Option**
   - Add button in settings/profile page
   - Resets `hasSeenTour` to false

**Files to Modify**:
- `src/App.js` - Add tour component and logic
- `src/config/firebase.js` - Add `updateUserProfile()` function
- `src/contexts/AppContext.js` - Include tour state
- `firestore.rules` - Allow `hasSeenTour` field update

---

### 3. User Profile Page 👤
**Status**: Not started
**Priority**: High
**Requested By**: User

**Features to Implement**:
1. **Personal Details Section**
   - Full name (editable)
   - Email (read-only, from Firebase Auth)
   - Phone number (optional)
   - Date of birth (optional)
   - Address (optional)
   - Member since (auto-calculated)

2. **Profile Photo Upload**
   - Click to upload image
   - Image preview before upload
   - Crop functionality (optional)
   - Upload to Firebase Storage
   - Max 5MB, images only (already secured in `storage.rules`)
   - Compress image before upload (use library like `browser-image-compression`)

3. **Credit Score Tracking**
   - Display current credit score
   - Historical chart (optional)
   - Link to update credit score

4. **Account Statistics**
   - Total cards added
   - Total expenses tracked
   - Total rewards earned
   - Account creation date
   - Last login

5. **Settings**
   - Change password (Firebase Auth)
   - Email preferences
   - Notification settings (future)
   - Delete account (with confirmation)

**Files to Create**:
- `src/components/UserProfile.js`
- `src/components/UserProfile.css`

**Files to Modify**:
- `src/App.js` - Add `/profile` route
- `src/config/firebase.js` - Add `uploadProfilePhoto()`, `updateUserProfile()`
- Navigation sidebar - Add "Profile" menu item

**Libraries Needed**:
```bash
npm install browser-image-compression
npm install react-image-crop  # for image cropping
```

**Firebase Storage Path**:
```
/users/{userId}/profile/avatar.jpg
```

---

### 4. Replace Alerts in Admin Components ⚠️
**Status**: Partially complete (user components done)
**Priority**: Medium

**Completed**:
- ✅ User logout confirmation (using `ConfirmDialog`)
- ✅ Delete card confirmation
- ✅ Delete expense confirmation

**Remaining**:
Check and replace any `window.alert()` or `window.confirm()` in:
- `src/admin/AdminLogin.js`
- `src/admin/AdminDashboard.js`
- `src/admin/` (any other admin components)

**Solution**:
- Use the existing `ConfirmDialog` component
- Import and add to admin components
- Replace all `alert()` calls with custom error dialogs

---

## Medium Priority Enhancements

### 5. Real-Time Data Updates 🔄
**Status**: Not implemented
**Priority**: Medium

**Current**: Data loads once on component mount
**Proposed**: Real-time updates using Firestore snapshots

**Benefits**:
- See changes instantly across devices
- Multi-device sync
- Collaborative features (future)

**Implementation**:
Replace `getDocs()` with `onSnapshot()` in:
- Card list
- Expense list
- Reviews
- Comments

**Example**:
```javascript
// Current
const expenses = await getExpenses(userId);

// Real-time
const unsubscribe = onSnapshot(
  collection(db, 'users', userId, 'expenses'),
  (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setExpenses(expenses);
  }
);
```

**Files to Modify**:
- `src/contexts/AppContext.js`
- `src/components/CardReviews.js`
- `src/components/RecommendationComments.js`

---

### 6. Expense Categories with Icons 🏷️
**Status**: Categories exist, need visual enhancement
**Priority**: Medium

**Current**: Text-based categories
**Proposed**: Category icons and color coding

**Implementation**:
```javascript
const EXPENSE_CATEGORIES = {
  'Dining': { icon: '🍽️', color: '#FF6B6B' },
  'Fuel': { icon: '⛽', color: '#4ECDC4' },
  'Groceries': { icon: '🛒', color: '#95E1D3' },
  'Travel': { icon: '✈️', color: '#F38181' },
  'Shopping': { icon: '🛍️', color: '#AA96DA' },
  'Entertainment': { icon: '🎬', color: '#FCBAD3' },
  'Bills': { icon: '📄', color: '#FFFFD2' },
  'Healthcare': { icon: '⚕️', color: '#A8E6CF' },
  'Education': { icon: '📚', color: '#FFD3B6' },
  'Others': { icon: '📌', color: '#FFAAA5' }
};
```

**Files to Create/Modify**:
- `src/utils/constants.js` - Define category config
- `src/components/Expenses.js` - Use icons
- `src/components/AddExpenseModal.js` - Show icons in dropdown

---

### 7. Export Data Feature 📊
**Status**: Not implemented
**Priority**: Medium

**Features**:
1. **Export Expenses to CSV**
   - Filter by date range
   - Filter by card
   - Download as CSV file

2. **Export Cards Summary to PDF**
   - All cards with details
   - Total credit limits
   - Current utilization
   - Generate PDF report

**Libraries Needed**:
```bash
npm install jspdf jspdf-autotable  # for PDF generation
```

**Implementation**:
```javascript
const exportExpensesToCSV = (expenses) => {
  const headers = ['Date', 'Category', 'Amount', 'Card', 'Description'];
  const rows = expenses.map(exp => [
    exp.date,
    exp.category,
    exp.amount,
    exp.cardName,
    exp.description
  ]);

  // Convert to CSV and trigger download
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};
```

**Files to Create**:
- `src/utils/exportUtils.js` - Export functions
- Add "Export" buttons to Dashboard and Expenses pages

---

### 8. Bulk Delete Expenses 🗑️
**Status**: Not implemented
**Priority**: Medium

**Features**:
- Select multiple expenses with checkboxes
- Delete selected expenses in one action
- Batch update card balances
- Confirm before delete

**Implementation**:
- Add checkbox column in expense table
- "Select All" checkbox
- "Delete Selected" button
- Use Firestore batch operations for efficiency

---

### 9. Expense Search and Filtering 🔍
**Status**: Basic category filter exists
**Priority**: Medium

**Enhancements**:
1. **Search**
   - Search by description
   - Search by card name
   - Search by amount range

2. **Advanced Filters**
   - Date range picker
   - Category multi-select
   - Card multi-select
   - Amount range slider
   - Sort by date/amount/category

3. **Saved Filters**
   - Save frequently used filter combinations
   - Quick filter presets (This Month, Last Quarter, etc.)

**Libraries Needed**:
```bash
npm install react-datepicker  # for date range picker
```

---

## Low Priority / Nice-to-Have Features

### 10. Credit Score History Chart 📈
**Status**: Not implemented
**Priority**: Low

**Features**:
- Track credit score over time
- Visual chart showing trends
- Store historical data in Firestore
- Monthly snapshots

**Libraries Needed**:
```bash
npm install recharts  # or chart.js
```

---

### 11. Push Notifications 🔔
**Status**: Not implemented
**Priority**: Low

**Use Cases**:
- Due date reminders (2 days before)
- High credit utilization warnings (>80%)
- New offers available
- Review reminders

**Implementation**:
- Firebase Cloud Messaging (FCM)
- Service worker for background notifications
- User permission request

---

### 12. Dark Mode 🌙
**Status**: Not implemented
**Priority**: Low

**Implementation**:
- CSS variables for colors
- Toggle in settings
- Save preference in user profile
- Respect system preferences

**Files to Modify**:
- `src/App.css` - Define CSS variables
- `src/components/UserProfile.js` - Add toggle
- All component CSS files - Use CSS variables

---

### 13. Multi-Language Support 🌍
**Status**: Not implemented
**Priority**: Low

**Languages**:
- English (default)
- Hindi
- Regional languages (future)

**Implementation**:
```bash
npm install react-i18next i18next
```

**Files to Create**:
- `src/locales/en.json`
- `src/locales/hi.json`
- `src/i18n.js` - Configuration

---

### 14. Bill Splitting Feature 💰
**Status**: Not implemented
**Priority**: Low

**Use Case**: Split restaurant bills, group expenses

**Features**:
- Create expense with multiple payers
- Calculate split amounts
- Track who owes whom
- Send payment reminders (optional)

---

### 15. Recurring Expenses 🔁
**Status**: Not implemented
**Priority**: Low

**Use Cases**:
- Netflix subscriptions
- EMI payments
- Utility bills

**Features**:
- Mark expense as recurring
- Set frequency (weekly, monthly, yearly)
- Auto-create on schedule (Cloud Functions)
- Edit/delete future occurrences

---

### 16. Budget Tracking 💵
**Status**: Not implemented
**Priority**: Low

**Features**:
- Set monthly budget per category
- Visual progress bars
- Alerts when nearing budget limit
- Budget vs actual comparison charts

---

### 17. Credit Card Comparison Tool 🔍
**Status**: Not implemented
**Priority**: Low

**Features**:
- Compare multiple cards side-by-side
- Highlight best card for specific categories
- Show total potential rewards
- Recommend card combinations

---

### 18. Integration with Bank APIs 🏦
**Status**: Not implemented
**Priority**: Low (complex)

**Features**:
- Auto-import transactions from bank
- Real-time balance updates
- Statement parsing
- OTP-based authentication

**Challenges**:
- Requires bank API partnerships
- Different APIs for each bank
- Security compliance (PCI-DSS)
- RBI regulations

---

## Technical Debt & Code Quality

### 19. Add Unit Tests 🧪
**Status**: No tests
**Priority**: Medium

**Testing Strategy**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Tests Needed**:
- Component rendering tests
- User interaction tests (clicking buttons, forms)
- Firestore function tests (mocked)
- Recommendation engine algorithm tests
- Security rule tests (Firebase Emulator)

**Coverage Goal**: 70%+

---

### 20. Performance Optimization ⚡
**Status**: Good, but can improve
**Priority**: Medium

**Optimizations**:
1. **Code Splitting**
   - Lazy load routes
   - Lazy load admin components

2. **Image Optimization**
   - Compress images before upload
   - WebP format
   - Lazy load images

3. **Bundle Size Reduction**
   - Analyze bundle with `npm run build --report`
   - Remove unused dependencies
   - Tree-shaking optimization

4. **Caching Strategy**
   - Service worker for offline support
   - Cache API responses
   - Firestore offline persistence (already enabled)

---

### 21. Error Tracking & Monitoring 📊
**Status**: Console.log only
**Priority**: Medium

**Implementation**:
```bash
npm install @sentry/react
```

**Setup Sentry**:
- Create Sentry account
- Add Sentry DSN to `.env`
- Wrap App in `<Sentry.ErrorBoundary>`
- Track user actions leading to errors

**Files to Modify**:
- `src/index.js` - Initialize Sentry
- `src/App.js` - Add error boundary

---

### 22. Accessibility (a11y) ♿
**Status**: Basic, needs improvement
**Priority**: Medium

**Improvements Needed**:
- Add ARIA labels to interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratio fixes
- Focus indicators
- Alt text for all images

**Testing Tools**:
```bash
npm install --save-dev @axe-core/react
```

---

### 23. Progressive Web App (PWA) 📱
**Status**: Partially implemented
**Priority**: Low

**Current**: Basic PWA setup from Create React App
**Enhancements Needed**:
- Custom service worker
- Offline functionality
- Add to home screen prompt
- Push notification support
- Background sync for failed requests

**Files to Modify**:
- `public/manifest.json` - Update PWA config
- `src/serviceWorker.js` - Custom caching strategies

---

## Admin Panel Enhancements

### 24. Admin Analytics Dashboard 📊
**Status**: Basic admin login exists
**Priority**: Medium

**Features Needed**:
1. **User Statistics**
   - Total registered users
   - Active users (last 7/30 days)
   - User growth chart
   - Geographic distribution

2. **Card Statistics**
   - Most popular cards
   - Average credit limit
   - Total cards added
   - Cards by bank

3. **Expense Analytics**
   - Total expenses tracked
   - Category distribution
   - Average expense amount
   - Monthly trends

4. **Review Analytics**
   - Average rating per card
   - Most reviewed cards
   - Review sentiment analysis (future)

**Files to Create**:
- `src/admin/Analytics.js`
- `src/admin/UserManagement.js`
- `src/admin/ContentModeration.js`

---

### 25. Content Moderation 🛡️
**Status**: Not implemented
**Priority**: Medium

**Features**:
- Review flagged reviews/comments
- Delete inappropriate content
- Ban users (temporarily/permanently)
- Spam detection (keyword filters)
- Auto-moderation with AI (future)

---

### 26. Offer Management System 🎁
**Status**: Offers hardcoded in card data
**Priority**: Low

**Proposed**:
- Admin can add/edit/delete offers
- Set offer validity dates
- Target specific cards or categories
- Push notifications for new offers
- Store offers in separate Firestore collection

---

## Documentation Improvements

### 27. API Documentation 📖
**Status**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) exists
**Priority**: Low

**Enhancements Needed**:
- Add Firestore function documentation
- Include request/response examples
- Document error codes
- Add authentication examples
- Interactive API explorer (Swagger/Postman)

---

### 28. Component Documentation 📝
**Status**: Minimal JSDoc comments
**Priority**: Low

**Implementation**:
- Add JSDoc comments to all components
- Document props with PropTypes
- Usage examples for each component
- Generate documentation with `react-docgen`

---

### 29. Deployment Automation 🚀
**Status**: Manual deployment
**Priority**: Low

**Implementation**:
1. **GitHub Actions Workflow**
   ```yaml
   name: Deploy to Firebase
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm ci
         - run: npm run build
         - run: firebase deploy --only hosting
   ```

2. **Environment Management**
   - Staging environment
   - Production environment
   - Separate Firebase projects

---

## Summary of Priorities

### Immediate (High Priority)
1. ✅ Fix user profile email overflow
2. ✅ Integrate AppTour component
3. ✅ Create user profile page
4. ✅ Replace alerts in admin components

### Short Term (Medium Priority)
5. Real-time data updates
6. Export data feature
7. Enhanced filtering and search
8. Unit tests
9. Error tracking
10. Admin analytics

### Long Term (Low Priority)
11. Dark mode
12. Multi-language support
13. Push notifications
14. Credit score history
15. PWA enhancements
16. Bank API integration

---

## How to Contribute

When implementing these tasks:

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/task-name
   ```

2. **Follow Code Style**
   - Use existing patterns
   - Add comments for complex logic
   - Update documentation

3. **Test Before Committing**
   - Test on desktop and mobile
   - Check browser console for errors
   - Verify Firestore security rules

4. **Update Documentation**
   - Update this file when task is complete
   - Add to FEATURES_COMPLETE.md
   - Update API_DOCUMENTATION.md if needed

5. **Create Pull Request**
   - Reference issue number
   - Describe changes made
   - Include screenshots if UI changes

---

## Conclusion

This comprehensive task list covers all pending work from:
- ✅ User requests from conversation
- ✅ Features mentioned in all .md files
- ✅ Technical debt identified
- ✅ Future enhancement ideas

Total Tasks: **29 tasks** organized by priority

Start with high-priority tasks and work your way down. Update this document as tasks are completed.

---

*Last Updated: 2025-12-24*
*Next Review: After completing high-priority tasks*
