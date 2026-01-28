# Firestore Data Migration Plan

## Current Storage Status

### Where Data is Currently Stored:

**1. localStorage (Browser Storage)**
- ✅ User authentication state (`isLoggedIn`, `currentUser`)
- ✅ Cards data
- ✅ Expenses data
- ⚠️ NOT PERSISTENT across devices
- ⚠️ LOST when browser data is cleared

**2. Component State (In-Memory)**
- ❌ Card reviews (lost on page refresh)
- ❌ Recommendation comments (lost on page refresh)
- ⚠️ COMPLETELY TEMPORARY
- ⚠️ NO DATA PERSISTENCE

**3. Firebase Authentication**
- ✅ User login/signup
- ✅ Email/password authentication
- ✅ User session management

**4. Firestore (Partially Used)**
- ✅ User profile data (`users` collection)
- ✅ Admin flag (`isAdmin`)
- ❌ Cards - NOT YET
- ❌ Expenses - NOT YET
- ❌ Reviews - NOT YET
- ❌ Comments - NOT YET

---

## Problems with Current Approach

### 1. Data Loss
- Reviews disappear on page refresh
- Comments don't persist
- No data sync across devices
- Browser clear = all data gone

### 2. No Multi-Device Support
- Can't access same data on phone and laptop
- Each browser has different data
- No cloud backup

### 3. No Real-Time Collaboration
- Can't share reviews with other users
- Comments are not truly "community-driven"
- No way to see what others have posted

### 4. Limited Features
- Can't implement:
  - User-specific reviews
  - Cross-device sync
  - Data analytics
  - Admin moderation
  - Real-time updates

---

## Firestore Migration Plan

### Collections Structure:

```
firestore/
├── users/
│   └── {userId}/
│       ├── name: string
│       ├── email: string
│       ├── creditScore: number
│       ├── isAdmin: boolean
│       └── createdAt: timestamp
│
├── cards/
│   └── {cardId}/
│       ├── userId: string (owner)
│       ├── cardName: string
│       ├── bankName: string
│       ├── cardNumber: string (last 4 digits)
│       ├── creditLimit: number
│       ├── currentBalance: number
│       ├── availableCredit: number
│       ├── dueDate: string
│       ├── minimumDue: number
│       ├── color: string
│       ├── rewards: object
│       ├── offers: array
│       └── createdAt: timestamp
│
├── expenses/
│   └── {expenseId}/
│       ├── userId: string
│       ├── cardId: string
│       ├── merchant: string
│       ├── amount: number
│       ├── category: string
│       ├── description: string
│       ├── date: string
│       ├── rewardsEarned: number
│       └── createdAt: timestamp
│
├── reviews/
│   └── {reviewId}/
│       ├── userId: string
│       ├── userName: string
│       ├── cardId: string (which card is being reviewed)
│       ├── rating: number (1-5)
│       ├── review: string
│       ├── pros: array<string>
│       ├── cons: array<string>
│       ├── wouldRecommend: boolean
│       ├── helpfulCount: number
│       ├── helpfulBy: array<userId> (who marked it helpful)
│       └── createdAt: timestamp
│
└── comments/
    └── {commentId}/
        ├── userId: string
        ├── userName: string
        ├── cardUsed: string
        ├── rating: number
        ├── comment: string
        ├── amount: number
        ├── category: string
        ├── benefitEarned: string
        ├── likes: number
        ├── likedBy: array<userId>
        └── createdAt: timestamp
```

---

## Implementation Steps

### Phase 1: Setup & User Data (Already Done ✅)
- Firebase project configured
- Authentication working
- User profiles in Firestore

### Phase 2: Cards Migration
**Files to Create:**
- `src/services/cardService.js`

**Functions Needed:**
```javascript
- addCard(userId, cardData)
- updateCard(cardId, updates)
- deleteCard(cardId)
- getUserCards(userId)
- getCardById(cardId)
```

**Changes to:**
- `src/contexts/AppContext.js` - Replace localStorage with Firestore calls
- `src/components/Cards.js` - Use Firestore data
- `src/components/AddCardModal.js` - Save to Firestore

### Phase 3: Expenses Migration
**Files to Create:**
- `src/services/expenseService.js`

**Functions Needed:**
```javascript
- addExpense(userId, expenseData)
- updateExpense(expenseId, updates)
- deleteExpense(expenseId)
- getUserExpenses(userId)
- getExpensesByCard(cardId)
- getExpensesByCategory(category)
- getExpensesByDateRange(startDate, endDate)
```

**Changes to:**
- `src/contexts/AppContext.js` - Replace localStorage
- `src/components/Expenses.js` - Use Firestore data
- `src/components/AddExpenseModal.js` - Save to Firestore

### Phase 4: Reviews Migration
**Files to Create:**
- `src/services/reviewService.js`

**Functions Needed:**
```javascript
- addReview(userId, reviewData)
- updateReview(reviewId, updates)
- deleteReview(reviewId)
- getCardReviews(cardId)
- markHelpful(reviewId, userId)
- unmarkHelpful(reviewId, userId)
- getAverageRating(cardId)
```

**Changes to:**
- `src/components/CardReviews.js` - Load/save from Firestore
- Add real-time listeners for new reviews

### Phase 5: Comments Migration
**Files to Create:**
- `src/services/commentService.js`

**Functions Needed:**
```javascript
- addComment(userId, commentData)
- getCommentsByCategory(category)
- likeComment(commentId, userId)
- unlikeComment(commentId, userId)
```

**Changes to:**
- `src/components/RecommendationComments.js` - Load/save from Firestore

---

## Benefits After Migration

### 1. Data Persistence
- ✅ All data saved to cloud
- ✅ Never lose data
- ✅ Automatic backups

### 2. Multi-Device Support
- ✅ Access from any device
- ✅ Real-time sync
- ✅ Same data everywhere

### 3. True Community Features
- ✅ Real user reviews
- ✅ Shared experiences
- ✅ Helpful voting
- ✅ See what others posted

### 4. Admin Features
- ✅ Moderate inappropriate content
- ✅ View all user data
- ✅ Analytics and insights
- ✅ User management

### 5. Advanced Features
- ✅ Search and filter
- ✅ Sort by date, rating, etc.
- ✅ User profiles
- ✅ Activity history
- ✅ Export data

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Cards collection
    match /cards/{cardId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Expenses collection
    match /expenses/{expenseId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId
                    || request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['helpfulCount', 'helpfulBy']);
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Comments collection
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId
                    || request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['likes', 'likedBy']);
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Migration Timeline

### Immediate (Today):
1. ✅ Replace all window.confirm with ConfirmDialog
2. 🔄 Create Firestore service files
3. 🔄 Migrate cards to Firestore

### Short Term (This Week):
4. Migrate expenses to Firestore
5. Migrate reviews to Firestore
6. Migrate comments to Firestore

### Future Enhancements:
7. Add search functionality
8. Add data export
9. Add analytics dashboard
10. Add user activity feed

---

## Current Task Priority

**Priority 1: Replace All Alerts** ✅
- Replace window.confirm in all files
- Use ConfirmDialog component
- Better UX for all confirmations

**Priority 2: Firestore Migration** 🔄
- Start with Cards
- Then Expenses
- Then Reviews
- Then Comments

---

**Next Steps:**
1. Finish replacing all window.confirm dialogs
2. Create cardService.js for Firestore operations
3. Update AppContext to use Firestore instead of localStorage
4. Test card CRUD operations with Firestore
5. Repeat for expenses, reviews, and comments
