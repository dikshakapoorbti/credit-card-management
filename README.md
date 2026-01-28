# CardManager - Smart Credit Card Management Application

A comprehensive credit card management application built with React and JavaScript that helps you manage multiple credit cards, track expenses, and get intelligent recommendations on which card to use for maximum rewards.

## Features

### 0. User Authentication & Login
- **Login/Sign Up**: Secure user authentication with email and password
- **Demo Account**: Instant access with pre-loaded demo data
- **LocalStorage**: Your data stays private on your device
- **User Profile**: Personalized experience with your name and email
- **Credit Score Widget**: Track your credit score in the sidebar

### 1. Dashboard
- **Financial Overview**: See all your credit cards, total credit limit, outstanding balance, and utilization at a glance
- **Credit Utilization Tracker**: Visual representation of your credit usage across all cards
- **Top Spending Categories**: Analyze where you spend the most
- **Upcoming Payment Dues**: Never miss a payment with due date reminders
- **Recent Transactions**: Quick view of your latest expenses

### 2. Card Management
- **Add Multiple Cards**: Store all your credit cards in one place
- **Visual Card Display**: Beautiful 3D card designs with realistic styling
- **Detailed Information**:
  - Credit limit and available balance
  - Rewards program details (Cashback, Reward Points, Airline Miles)
  - Benefits and perks
  - Payment due dates
  - Category-wise reward rates

### 3. Smart Expense Tracking
- **Add Expenses**: Record transactions with merchant, amount, and category
- **Filter & Sort**: Filter by category or card, analyze spending patterns
- **Rewards Calculation**: Automatically calculate rewards earned on each transaction

### 4. Intelligent Card Recommendations
The app's standout feature - when adding a new expense, it analyzes all your cards and recommends the best one based on:
- **Reward Rate**: Maximum cashback/points for the expense category
- **Credit Utilization**: Keeps your utilization healthy
- **Available Credit**: Ensures sufficient balance
- **Payment Due Dates**: Considers billing cycles

The recommendation engine scores each card and shows you:
- Estimated rewards you'll earn
- Impact on credit utilization
- Why this card is recommended

## Demo Data

The application comes pre-loaded with realistic demo data:
- **4 Credit Cards**: HDFC Regalia, SBI Cashback, Axis Vistara Infinite, ICICI Amazon Pay
- **8 Sample Transactions**: Across various categories (Dining, Travel, Shopping, etc.)
- Complete reward structures and benefits for each card

## Tech Stack

- **React** - UI framework
- **JavaScript** - Programming language
- **Context API** - State management
- **CSS3** - Styling with modern gradients and animations
- **No external dependencies** - Pure React implementation

## Installation & Setup

1. The project is already initialized in the current directory

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Getting Started

### First Time Access

When you first open the app, you'll see the **Login Page** with three options:

1. **Try Demo Account** (Recommended!)
   - Click the "Try Demo Account" button
   - Instantly access the app with pre-loaded demo data
   - 4 credit cards and 8 sample transactions ready to explore

2. **Sign Up**
   - Create a new account with your name, email, and password
   - Your data will be stored locally on your device
   - Minimum 6 characters for password

3. **Login**
   - If you've created an account before
   - Enter your email and password

### Accessing Login Page Again

If you want to see the login page again:

**Option 1: Clear Browser Data**
- Open browser console (F12 or Ctrl+Shift+I)
- Type: `localStorage.clear()`
- Press Enter and refresh the page

**Option 2: Use Incognito/Private Window**
- Open http://localhost:3000 in incognito mode

**Option 3: Logout**
- Click the Logout button (🚪) in the sidebar

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js          # Main dashboard with analytics
│   ├── Dashboard.css
│   ├── Cards.js              # Card management view
│   ├── Cards.css
│   ├── Expenses.js           # Expense tracking
│   ├── Expenses.css
│   ├── AddCardModal.js       # Modal to add new cards
│   ├── AddExpenseModal.js    # Modal to add expenses with recommendations
│   └── Modal.css             # Shared modal styles
├── contexts/
│   └── AppContext.js         # Global state management
├── data/
│   └── demoData.js           # Demo cards and expenses
├── utils/
│   └── recommendationEngine.js  # Smart card recommendation algorithm
├── App.js                    # Main app component with navigation
└── App.css                   # Global styles
```

## How to Use

### Adding a Credit Card
1. Navigate to "My Cards" section
2. Click "Add New Card" button
3. Fill in card details:
   - Card name and bank
   - Card number (will be masked)
   - Credit limit and due date
   - Select reward type and card color
4. Click "Add Card"

### Recording an Expense
1. Navigate to "Expenses" section
2. Click "Add Expense" button
3. Enter merchant name and amount
4. Select category
5. The app will automatically show recommendations for the best card to use
6. Click on the recommended card to select it
7. Add optional description and submit

### Viewing Insights
- The Dashboard provides comprehensive insights into your spending patterns
- Credit utilization is tracked and color-coded (Green: Excellent, Blue: Good, Orange: Moderate, Red: High)
- Top spending categories help you understand where your money goes
- Upcoming dues ensure you never miss a payment

## Recommendation Algorithm

The smart recommendation engine considers:

1. **Reward Value (40% weight)**: Calculates actual rewards you'll earn
2. **Credit Utilization (30% weight)**: Prefers cards with lower utilization
3. **Available Credit (20% weight)**: Ensures sufficient balance
4. **Payment Due Date (10% weight)**: Considers billing cycles

Each card is scored and ranked, with the top 3 recommendations shown with detailed reasoning.

## Features Inspired By

This application takes inspiration from:
- **CRED**: Clean UI, reward tracking, credit score insights
- **Paytm**: Multi-card management, expense categorization
- Enhanced with intelligent recommendation system

## Customization

You can customize:
- Card colors when adding a new card
- Expense categories in `src/data/demoData.js`
- Reward calculation logic in `src/utils/recommendationEngine.js`
- Styling via CSS files

## Future Enhancements

Potential features to add:
- Payment reminders and notifications
- Export statements to PDF/CSV
- Credit score tracking integration
- Bill splitting functionality
- Recurring expense tracking
- Budget setting and alerts
- Multi-currency support
- Dark/Light theme toggle

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This is a demo application for educational and portfolio purposes.

## Credits

Created by Diksha Kapoor
