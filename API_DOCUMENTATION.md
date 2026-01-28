# API Documentation

## Overview

This document explains the API integrations, ML model, and security features in the CardManager application.

---

## Table of Contents

1. [Balance API Integration](#balance-api-integration)
2. [ML Recommendation Model](#ml-recommendation-model)
3. [API Security](#api-security)
4. [Firebase Integration](#firebase-integration)
5. [Usage Examples](#usage-examples)

---

## Balance API Integration

### Overview

The Balance API service provides integration with external banking APIs to check real-time card balances and verify transactions.

### File Location
`src/services/balanceApi.js`

### Features

1. **Check Card Balance**
2. **Verify Transactions**
3. **Get Card Offers**
4. **Sync Card Data**

### API Methods

#### 1. Check Card Balance

```javascript
import { checkCardBalance } from '../services/balanceApi';

const balanceInfo = await checkCardBalance({
  id: 'card123',
  lastFourDigits: '1234',
  currentBalance: 50000,
  availableCredit: 150000,
  creditLimit: 200000
});

// Response:
{
  success: true,
  data: {
    currentBalance: 50000,
    availableCredit: 150000,
    creditLimit: 200000,
    lastUpdated: "2025-12-19T10:30:00Z",
    recentTransactions: [...]
  }
}
```

#### 2. Verify Transaction

```javascript
import { verifyTransaction } from '../services/balanceApi';

const verification = await verifyTransaction({
  cardId: 'card123',
  amount: 5000,
  merchant: 'Amazon',
  category: 'Shopping'
});

// Response:
{
  success: true,
  verified: true,
  transactionId: "txn_1234567890",
  timestamp: "2025-12-19T10:30:00Z"
}
```

#### 3. Get Card Offers

```javascript
import { getCardOffers } from '../services/balanceApi';

const offers = await getCardOffers('card123');

// Response:
{
  success: true,
  offers: [
    {
      id: "offer1",
      title: "10% cashback on dining",
      description: "Get extra cashback this month",
      validUntil: "2025-12-31",
      category: "Dining"
    }
  ]
}
```

### Security Features

- **Bearer Token Authentication**: All API requests include JWT tokens
- **Request Interceptors**: Automatically add auth headers
- **Response Interceptors**: Handle 401 errors and token refresh
- **Timeout Protection**: 10-second timeout on all requests

### Configuration

Set your API base URL in `.env`:
```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

---

## ML Recommendation Model

### Overview

The ML-based recommendation engine uses machine learning principles to suggest the best credit card for each transaction.

### File Location
`src/services/mlRecommendationModel.js`

### Architecture

```
Input: Cards + Expense Details
  ↓
Feature Extraction
  ↓
Weighted Scoring
  ↓
Confidence Calculation
  ↓
Output: Ranked Recommendations
```

### Features Extracted

1. **Reward Rate** (35% weight)
   - Category-specific rewards
   - Normalized to 0-1 scale

2. **Category Match** (25% weight)
   - Historical category preferences
   - Frequency of category usage

3. **Credit Utilization** (20% weight)
   - Current utilization
   - Impact after transaction

4. **Spending History** (10% weight)
   - Historical performance per card
   - Average rewards earned

5. **Available Credit** (5% weight)
   - Sufficient balance check

6. **Due Date** (5% weight)
   - Days until payment due

### Usage

#### Training the Model

```javascript
import mlModel from '../services/mlRecommendationModel';

// Train with historical data
mlModel.train(expenses, cards);

// Model learns:
// - Spending patterns
// - Category preferences
// - Optimal reward strategies
```

#### Getting Recommendations

```javascript
const expense = {
  category: 'Dining',
  amount: 2500
};

const recommendations = mlModel.predict(cards, expense);

// Response:
[
  {
    card: {...},
    score: 85.6,
    confidence: 92,
    features: {
      rewardRate: 0.9,
      categoryMatch: 0.85,
      utilizationScore: 0.8,
      ...
    },
    reason: "🎯 High reward rate for this category • ✨ Perfect category match"
  },
  ...
]
```

### Model Training

The model automatically trains on:
- User's historical transactions
- Category spending patterns
- Card performance metrics

**Training triggers**:
- App initialization
- New expense added
- Periodic re-training (every 10 transactions)

### Adaptive Learning

The model weights adjust based on:
- Category impact on rewards
- Utilization impact on financial health
- User behavior patterns

Learning rate: **0.1** (conservative updates)

### Model Statistics

```javascript
const stats = mlModel.getModelStats();

// Returns:
{
  weights: {
    rewardRate: 0.35,
    categoryMatch: 0.25,
    ...
  },
  trainingDataSize: 120,
  categoryPreferences: {...},
  cardPerformance: {...}
}
```

---

## API Security

### Authentication Flow

```
User Login
  ↓
Firebase Auth
  ↓
Get Access Token
  ↓
Store in localStorage
  ↓
Add to API Headers
  ↓
Verify on Backend
```

### Security Features

#### 1. JWT Token Management

```javascript
// Stored in localStorage
const token = localStorage.getItem('authToken');

// Automatically added to requests
headers: {
  'Authorization': `Bearer ${token}`
}
```

#### 2. Request Interceptor

```javascript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

#### 3. Response Interceptor

```javascript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout and redirect
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only authenticated user can access their data
      allow read, write: if request.auth.uid == userId;

      match /cards/{cardId} {
        allow read, write: if request.auth.uid == userId;
      }

      match /expenses/{expenseId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

### Best Practices

1. **Never expose API keys** in client code
2. **Use environment variables** for configuration
3. **Implement token refresh** before expiration
4. **Validate all inputs** on backend
5. **Use HTTPS only** for production
6. **Rate limiting** on API endpoints
7. **Audit logs** for sensitive operations

---

## Firebase Integration

### Authentication

```javascript
import { signInWithGoogle, logoutUser } from '../config/firebase';

// Sign in
const user = await signInWithGoogle();

// Sign out
await logoutUser();
```

### Firestore Operations

#### Save Card

```javascript
import { saveCard } from '../config/firebase';

await saveCard(userId, {
  id: 'card123',
  cardName: 'HDFC Regalia',
  creditLimit: 500000,
  ...
});
```

#### Get Cards

```javascript
import { getCards } from '../config/firebase';

const cards = await getCards(userId);
```

#### Save Expense

```javascript
import { saveExpense } from '../config/firebase';

await saveExpense(userId, {
  id: 'exp123',
  amount: 2500,
  category: 'Dining',
  ...
});
```

---

## Usage Examples

### Complete Transaction Flow

```javascript
// 1. User adds expense
const expense = {
  merchant: 'Amazon',
  amount: 5000,
  category: 'Online Shopping'
};

// 2. Get ML recommendations
const recommendations = mlModel.predict(cards, expense);
const bestCard = recommendations[0].card;

// 3. Verify transaction
const verification = await verifyTransaction({
  cardId: bestCard.id,
  amount: expense.amount,
  merchant: expense.merchant
});

// 4. If verified, save to Firestore
if (verification.verified) {
  await saveExpense(userId, {
    ...expense,
    cardId: bestCard.id,
    rewardsEarned: calculateRewards(bestCard, expense)
  });

  // 5. Update card balance
  await checkCardBalance(bestCard);

  // 6. Re-train ML model
  mlModel.train([...expenses, expense], cards);
}
```

### Error Handling

```javascript
try {
  const balance = await checkCardBalance(card);
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 429) {
    // Rate limited
    alert('Too many requests. Please try again later.');
  } else {
    // Other errors
    console.error('API Error:', error.message);
  }
}
```

---

## Environment Variables

Required environment variables:

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# API
REACT_APP_API_BASE_URL=

# Environment
NODE_ENV=production
```

---

## Testing

### Mock API Responses

The current implementation uses mock responses for development. To connect to real APIs:

1. Update `API_BASE_URL` in `.env`
2. Uncomment real API calls in `balanceApi.js`
3. Implement backend endpoints
4. Add error handling for specific API responses

### ML Model Testing

```javascript
// Test with sample data
const testExpenses = [...];
const testCards = [...];

mlModel.train(testExpenses, testCards);

const prediction = mlModel.predict(testCards, {
  category: 'Dining',
  amount: 2500
});

console.log('Prediction:', prediction);
console.log('Model Stats:', mlModel.getModelStats());
```

---

## Performance Optimization

1. **API Caching**: Responses cached for 5 minutes
2. **Batch Requests**: Multiple operations in single call
3. **Lazy Loading**: Load data only when needed
4. **Request Debouncing**: Prevent rapid successive calls
5. **Offline Support**: Queue requests when offline

---

## Future Enhancements

1. **Real-time Sync**: WebSocket for instant updates
2. **Advanced ML**: Neural network for predictions
3. **Fraud Detection**: ML-based anomaly detection
4. **Spending Insights**: Predictive analytics
5. **Budget Alerts**: Smart notifications
6. **Multi-currency**: International transaction support

---

## Support

For questions or issues:
1. Check [Firebase Setup Guide](FIREBASE_SETUP.md)
2. Review [Storage Comparison](STORAGE_COMPARISON.md)
3. See [Features Documentation](FEATURES_COMPLETE.md)

---

Last Updated: December 19, 2025
