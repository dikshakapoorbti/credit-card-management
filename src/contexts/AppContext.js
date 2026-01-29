import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../config/firebase';
import { getUserProfile } from '../config/firebase';
import api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [cards, setCards] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCreditCards, setAllCreditCards] = useState([]); // Master list of all available cards
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null); // PostgreSQL user record
  const [isLoading, setIsLoading] = useState(true);

  // Track if initial load is complete to prevent infinite loops
  const isInitialLoad = useRef(true);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    loadAllCreditCards();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAllCreditCards = async () => {
    try {
      const cardsData = await api.getAllCreditCards({ active: true });
      setAllCreditCards(cardsData);
    } catch (error) {
      console.error('Error loading credit cards:', error);
    }
  };

  // Listen to auth state changes and load user data from PostgreSQL
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);

      if (firebaseUser) {
        try {
          // Get or create user in PostgreSQL database
          const postgresUser = await api.getOrCreateUser(firebaseUser);
          setDbUser(postgresUser);

          // Also try to get Firebase profile for additional data
          let userProfile = {};
          try {
            userProfile = await getUserProfile(firebaseUser.uid) || {};
          } catch (e) {
            console.warn('Could not load Firebase profile:', e);
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: postgresUser.name || firebaseUser.displayName || 'User',
            id: postgresUser.id, // PostgreSQL user ID
            ...userProfile
          });

          // Load user's cards from PostgreSQL
          if (postgresUser.id) {
            await loadUserCards(postgresUser.id);
            await loadUserExpenses(postgresUser.id);
          }
        } catch (error) {
          console.error('Error loading data from PostgreSQL:', error);
          // Fallback to localStorage if backend fails
          const storedUser = localStorage.getItem('user');
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } else {
        // User is logged out
        setUser(null);
        setDbUser(null);
        setCards([]);
        setExpenses([]);
      }

      setIsLoading(false);
      isInitialLoad.current = false;
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const loadUserCards = async (userId) => {
    try {
      const userCards = await api.getUserCards(userId);
      // Transform to match existing frontend structure
      const transformedCards = userCards.map(uc => ({
        id: uc.card.id.toString(),
        userCardId: uc.id,
        cardName: uc.card.cardName,
        bankName: uc.card.bank.name,
        lastFourDigits: uc.last4Digits || '****',
        cardType: 'Credit',
        cardNetwork: uc.card.cardNetwork,
        creditLimit: 500000, // Default, can be customized
        availableCredit: 500000,
        currentBalance: 0,
        verified: uc.verified,
        color: getCardColor(uc.card.bank.name),
        annualFee: parseFloat(uc.card.annualFee),
        feeWaiverSpend: uc.card.feeWaiverSpend ? parseFloat(uc.card.feeWaiverSpend) : null,
        cashbackRules: uc.card.cashbackRules || [],
        // Add offers from cashback rules
        offers: (uc.card.cashbackRules || []).map(rule => ({
          id: rule.id,
          category: rule.category?.name,
          categoryId: rule.categoryId,
          cashbackPercent: parseFloat(rule.cashbackPercent),
          maxBenefit: rule.maxCashback ? parseFloat(rule.maxCashback) : null,
          rewardType: rule.rewardType,
          description: `${rule.cashbackPercent}% ${rule.rewardType} on ${rule.category?.name}`,
          rewardCycle: rule.rewardCycle
        }))
      }));
      setCards(transformedCards);
    } catch (error) {
      console.error('Error loading user cards:', error);
    }
  };

  const loadUserExpenses = async (userId) => {
    try {
      const data = await api.getUserExpenses(userId, { limit: 100 });
      // Transform expenses to match frontend structure
      const transformedExpenses = data.expenses.map(exp => ({
        id: exp.id.toString(),
        category: exp.category.name,
        categoryId: exp.categoryId,
        amount: parseFloat(exp.amount),
        merchant: exp.merchant,
        date: exp.expenseDate.split('T')[0],
        status: 'completed'
      }));
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  // Get gradient color based on bank name
  const getCardColor = (bankName) => {
    const colors = {
      'HDFC Bank': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'ICICI Bank': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'SBI Card': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Axis Bank': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    };
    return colors[bankName] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const addCard = async (cardData) => {
    if (!dbUser?.id) throw new Error('User not logged in');

    try {
      // cardData should contain the selected card's ID from master list
      const response = await api.addUserCard(
        dbUser.id,
        cardData.cardId,
        cardData.last4Digits || cardData.lastFourDigits
      );

      // Reload cards to get updated list
      await loadUserCards(dbUser.id);

      return response.data;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  const updateCard = async (cardId, updates) => {
    // For now, just update local state
    // Backend card updates would be for admin only
    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    );
    setCards(updatedCards);
  };

  const deleteCard = async (cardId) => {
    if (!dbUser?.id) throw new Error('User not logged in');

    try {
      await api.removeUserCard(dbUser.id, parseInt(cardId));

      // Update local state
      setCards(cards.filter(card => card.id !== cardId));
      setExpenses(expenses.filter(expense => expense.cardId !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  const addExpense = async (expense) => {
    if (!dbUser?.id) throw new Error('User not logged in');

    try {
      // Find category ID from name
      const category = categories.find(c => c.name === expense.category);

      const response = await api.addExpense(dbUser.id, {
        categoryId: category?.id || expense.categoryId,
        amount: expense.amount,
        merchant: expense.merchant,
        expenseDate: expense.date || new Date().toISOString()
      });

      // Reload expenses
      await loadUserExpenses(dbUser.id);

      return response.data;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (expenseId) => {
    // Note: Backend doesn't have delete expense yet
    // For now, just update local state
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };

  const getCardById = (cardId) => {
    return cards.find(card => card.id === cardId);
  };

  const getExpensesByCard = (cardId) => {
    return expenses.filter(expense => expense.cardId === cardId);
  };

  // Get recommendation for an expense
  const getRecommendation = async (categoryName, amount, merchant = null) => {
    if (!dbUser?.id) throw new Error('User not logged in');

    const category = categories.find(c => c.name === categoryName);
    if (!category) throw new Error('Category not found');

    return api.getRecommendation(dbUser.id, category.id, amount, merchant);
  };

  // Get best cards by category for current user
  const getBestCards = async () => {
    if (!dbUser?.id) return [];
    return api.getBestCardsByCategory(dbUser.id);
  };

  const updateUser = (userData) => {
    setUser(userData);
    // Keep localStorage as backup
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      const { logoutUser } = await import('../config/firebase');
      await logoutUser();
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setDbUser(null);
      setCards([]);
      setExpenses([]);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if Firebase logout fails
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setDbUser(null);
      setCards([]);
      setExpenses([]);
    }
  };

  const value = {
    cards,
    expenses,
    categories,
    allCreditCards,
    user,
    dbUser,
    isLoading,
    setCards,
    setExpenses,
    addCard,
    updateCard,
    deleteCard,
    addExpense,
    deleteExpense,
    getCardById,
    getExpensesByCard,
    getRecommendation,
    getBestCards,
    updateUser,
    logout,
    loadUserCards,
    loadUserExpenses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
