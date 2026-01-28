import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../config/firebase';
import {
  getCards,
  saveCard,
  deleteCard as deleteCardFirestore,
  getExpenses,
  saveExpense,
  deleteExpense as deleteExpenseFirestore,
  getUserProfile
} from '../config/firebase';

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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track if initial load is complete to prevent infinite loops
  const isInitialLoad = useRef(true);

  // Listen to auth state changes and load user data from Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);

      if (firebaseUser) {
        try {
          // Load user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);

          if (userProfile) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userProfile
            });
          } else {
            // Set basic user info if profile doesn't exist yet
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              creditScore: null
            });
          }

          // Load cards from Firestore
          const firestoreCards = await getCards(firebaseUser.uid);
          setCards(firestoreCards);

          // Load expenses from Firestore
          const firestoreExpenses = await getExpenses(firebaseUser.uid);
          setExpenses(firestoreExpenses);
        } catch (error) {
          console.error('Error loading data from Firestore:', error);
          // Fallback to localStorage if Firestore fails
          const storedUser = localStorage.getItem('user');
          const storedCards = localStorage.getItem('cards');
          const storedExpenses = localStorage.getItem('expenses');

          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedCards) setCards(JSON.parse(storedCards));
          if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
        }
      } else {
        // User is logged out
        setUser(null);
        setCards([]);
        setExpenses([]);
      }

      setIsLoading(false);
      isInitialLoad.current = false;
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const addCard = async (card) => {
    const newCard = {
      ...card,
      id: Date.now().toString(),
      currentBalance: 0,
      availableCredit: card.creditLimit
    };

    try {
      if (user?.uid) {
        await saveCard(user.uid, newCard);
      }
      setCards([...cards, newCard]);
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  const updateCard = async (cardId, updates) => {
    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    );

    try {
      if (user?.uid) {
        const updatedCard = updatedCards.find(c => c.id === cardId);
        if (updatedCard) {
          await saveCard(user.uid, updatedCard);
        }
      }
      setCards(updatedCards);
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  const deleteCard = async (cardId) => {
    try {
      if (user?.uid) {
        await deleteCardFirestore(user.uid, cardId);

        // Also delete related expenses
        const relatedExpenses = expenses.filter(exp => exp.cardId === cardId);
        for (const expense of relatedExpenses) {
          await deleteExpenseFirestore(user.uid, expense.id);
        }
      }
      setCards(cards.filter(card => card.id !== cardId));
      setExpenses(expenses.filter(expense => expense.cardId !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  const addExpense = async (expense) => {
    const newExpense = {
      ...expense,
      id: `exp${Date.now()}`,
      status: 'completed',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      if (user?.uid) {
        await saveExpense(user.uid, newExpense);
      }

      // Update card balance
      const card = cards.find(c => c.id === expense.cardId);
      if (card) {
        await updateCard(card.id, {
          currentBalance: card.currentBalance + expense.amount,
          availableCredit: card.availableCredit - expense.amount
        });
      }

      setExpenses([newExpense, ...expenses]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);

    try {
      if (user?.uid) {
        await deleteExpenseFirestore(user.uid, expenseId);
      }

      if (expense) {
        const card = cards.find(c => c.id === expense.cardId);
        if (card) {
          await updateCard(card.id, {
            currentBalance: card.currentBalance - expense.amount,
            availableCredit: card.availableCredit + expense.amount
          });
        }
      }

      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const getCardById = (cardId) => {
    return cards.find(card => card.id === cardId);
  };

  const getExpensesByCard = (cardId) => {
    return expenses.filter(expense => expense.cardId === cardId);
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
      setCards([]);
      setExpenses([]);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if Firebase logout fails
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setCards([]);
      setExpenses([]);
    }
  };

  const value = {
    cards,
    expenses,
    user,
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
    updateUser,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
