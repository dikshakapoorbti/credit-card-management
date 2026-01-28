// Demo credit cards data
export const demoCards = [
  {
    id: '1',
    cardName: 'HDFC Regalia',
    bankName: 'HDFC Bank',
    cardNumber: '4532********1234',
    lastFourDigits: '1234',
    cardType: 'Credit',
    expiryDate: '12/2027',
    creditLimit: 500000,
    availableCredit: 425000,
    currentBalance: 75000,
    dueDate: '2025-12-25',
    minimumDue: 3750,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    rewards: {
      type: 'Reward Points',
      pointsBalance: 12500,
      pointsPerRupee: 4,
      categories: {
        'Dining': 10,
        'Travel': 6,
        'Shopping': 4,
        'Others': 2
      }
    },
    offers: [
      {
        id: 'offer1',
        category: 'Dining',
        cashbackPercent: 10,
        rewardPointsMultiplier: 10,
        maxBenefit: 1500,
        minTransaction: 500,
        description: '10X reward points on dining',
        validTill: '2025-12-31',
        terms: 'Valid on select partner restaurants'
      },
      {
        id: 'offer2',
        category: 'Travel',
        cashbackPercent: 0,
        rewardPointsMultiplier: 6,
        maxBenefit: 5000,
        minTransaction: 1000,
        description: '6X reward points on travel bookings',
        validTill: '2025-12-31',
        terms: 'Valid on flights, hotels, and holiday packages'
      }
    ],
    benefits: [
      'Complimentary airport lounge access (6 per year)',
      'Fuel surcharge waiver',
      '1% cashback on all spends',
      'Insurance coverage up to ₹10 lakhs'
    ]
  },
  {
    id: '2',
    cardName: 'SBI Cashback',
    bankName: 'State Bank of India',
    cardNumber: '5425********5678',
    lastFourDigits: '5678',
    cardType: 'Credit',
    expiryDate: '09/2026',
    creditLimit: 300000,
    availableCredit: 280000,
    currentBalance: 20000,
    dueDate: '2025-12-28',
    minimumDue: 1000,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    rewards: {
      type: 'Cashback',
      cashbackBalance: 2500,
      cashbackPercentage: 5,
      categories: {
        'Online Shopping': 5,
        'Groceries': 3,
        'Utilities': 2,
        'Others': 1
      }
    },
    offers: [
      {
        id: 'offer3',
        category: 'Online Shopping',
        cashbackPercent: 5,
        rewardPointsMultiplier: 0,
        maxBenefit: 2000,
        minTransaction: 1000,
        description: '5% cashback on online shopping',
        validTill: '2025-12-31',
        terms: 'Valid on Amazon, Flipkart, Myntra'
      },
      {
        id: 'offer4',
        category: 'Groceries',
        cashbackPercent: 3,
        rewardPointsMultiplier: 0,
        maxBenefit: 1000,
        minTransaction: 500,
        description: '3% cashback on groceries',
        validTill: '2025-12-31',
        terms: 'Valid at supermarkets and online grocery apps'
      }
    ],
    benefits: [
      '5% cashback on online shopping',
      'No annual fee',
      'Zero forex markup on international transactions',
      'EMI conversion available'
    ]
  },
  {
    id: '3',
    cardName: 'Axis Vistara Infinite',
    bankName: 'Axis Bank',
    cardNumber: '4916********9012',
    lastFourDigits: '9012',
    cardType: 'Credit',
    expiryDate: '03/2028',
    creditLimit: 800000,
    availableCredit: 750000,
    currentBalance: 50000,
    dueDate: '2025-12-20',
    minimumDue: 2500,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    rewards: {
      type: 'Airline Miles',
      pointsBalance: 45000,
      pointsPerRupee: 3,
      categories: {
        'Travel': 10,
        'Dining': 5,
        'Shopping': 3,
        'Others': 2
      }
    },
    offers: [
      {
        id: 'offer5',
        category: 'Travel',
        cashbackPercent: 0,
        rewardPointsMultiplier: 10,
        maxBenefit: 10000,
        minTransaction: 5000,
        description: '10X miles on flight bookings',
        validTill: '2025-12-31',
        terms: 'Valid on Vistara and partner airlines'
      },
      {
        id: 'offer6',
        category: 'Dining',
        cashbackPercent: 0,
        rewardPointsMultiplier: 5,
        maxBenefit: 2500,
        minTransaction: 1000,
        description: '5X miles on dining',
        validTill: '2025-12-31',
        terms: 'Valid at restaurants and food delivery'
      }
    ],
    benefits: [
      'Complimentary Club Vistara Silver membership',
      'Unlimited airport lounge access',
      'Buy 1 Get 1 free on flight bookings',
      'Milestone benefits up to 25,000 miles'
    ]
  },
  {
    id: '4',
    cardName: 'ICICI Amazon Pay',
    bankName: 'ICICI Bank',
    cardNumber: '4024********3456',
    lastFourDigits: '3456',
    cardType: 'Credit',
    expiryDate: '06/2027',
    creditLimit: 200000,
    availableCredit: 185000,
    currentBalance: 15000,
    dueDate: '2025-12-22',
    minimumDue: 750,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    rewards: {
      type: 'Cashback',
      cashbackBalance: 1800,
      cashbackPercentage: 5,
      categories: {
        'Amazon': 5,
        'Bill Payments': 2,
        'Others': 1
      }
    },
    offers: [
      {
        id: 'offer7',
        category: 'Amazon',
        cashbackPercent: 5,
        rewardPointsMultiplier: 0,
        maxBenefit: null, // Unlimited
        minTransaction: 0,
        description: '5% unlimited cashback on Amazon',
        validTill: '2025-12-31',
        terms: 'Valid for Prime members only'
      },
      {
        id: 'offer8',
        category: 'Bill Payments',
        cashbackPercent: 2,
        rewardPointsMultiplier: 0,
        maxBenefit: 500,
        minTransaction: 100,
        description: '2% cashback on bill payments',
        validTill: '2025-12-31',
        terms: 'Valid on utility, mobile, and DTH recharges'
      }
    ],
    benefits: [
      '5% unlimited cashback on Amazon',
      '2% cashback on bill payments',
      'Fuel surcharge waiver',
      'Zero annual fee'
    ]
  }
];

// Demo expenses data
export const demoExpenses = [
  {
    id: 'exp1',
    cardId: '1',
    category: 'Dining',
    merchant: 'Olive Garden Restaurant',
    amount: 2500,
    date: '2025-12-15',
    description: 'Dinner with family',
    rewardsEarned: 25000,
    status: 'completed'
  },
  {
    id: 'exp2',
    cardId: '2',
    category: 'Online Shopping',
    merchant: 'Amazon India',
    amount: 8500,
    date: '2025-12-14',
    description: 'Electronics purchase',
    rewardsEarned: 425,
    status: 'completed'
  },
  {
    id: 'exp3',
    cardId: '3',
    category: 'Travel',
    merchant: 'MakeMyTrip',
    amount: 15000,
    date: '2025-12-12',
    description: 'Flight booking to Goa',
    rewardsEarned: 150000,
    status: 'completed'
  },
  {
    id: 'exp4',
    cardId: '1',
    category: 'Shopping',
    merchant: 'Westside',
    amount: 4200,
    date: '2025-12-10',
    description: 'Clothing shopping',
    rewardsEarned: 16800,
    status: 'completed'
  },
  {
    id: 'exp5',
    cardId: '4',
    category: 'Amazon',
    merchant: 'Amazon India',
    amount: 3200,
    date: '2025-12-08',
    description: 'Books and stationery',
    rewardsEarned: 160,
    status: 'completed'
  },
  {
    id: 'exp6',
    cardId: '2',
    category: 'Groceries',
    merchant: 'BigBasket',
    amount: 5600,
    date: '2025-12-07',
    description: 'Monthly groceries',
    rewardsEarned: 168,
    status: 'completed'
  },
  {
    id: 'exp7',
    cardId: '1',
    category: 'Dining',
    merchant: 'Starbucks',
    amount: 850,
    date: '2025-12-05',
    description: 'Coffee and snacks',
    rewardsEarned: 8500,
    status: 'completed'
  },
  {
    id: 'exp8',
    cardId: '3',
    category: 'Dining',
    merchant: 'Barbeque Nation',
    amount: 3200,
    date: '2025-12-03',
    description: 'Weekend dinner',
    rewardsEarned: 16000,
    status: 'completed'
  }
];

// Expense categories for recommendations
export const expenseCategories = [
  'Dining',
  'Travel',
  'Shopping',
  'Online Shopping',
  'Groceries',
  'Utilities',
  'Fuel',
  'Entertainment',
  'Healthcare',
  'Education',
  'Bill Payments',
  'Amazon',
  'Others'
];

// Demo user profile
export const demoUser = {
  name: 'Diksha Kapoor',
  email: 'diksha@example.com',
  phone: '+91 98765 43210',
  memberSince: '2022-01-15',
  totalCards: 4,
  creditScore: 785,
  totalCreditLimit: 1800000,
  totalOutstanding: 160000
};
