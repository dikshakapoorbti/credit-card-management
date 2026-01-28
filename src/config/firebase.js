import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where, orderBy, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase configuration
// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Verify Firebase configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
  console.error('Firebase not configured. Check .env file and restart server.');
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Firestore functions for cards
export const saveCard = async (userId, card) => {
  try {
    const cardRef = doc(db, 'users', userId, 'cards', card.id);
    await setDoc(cardRef, card);
    return card;
  } catch (error) {
    console.error("Error saving card:", error);
    throw error;
  }
};

export const getCards = async (userId) => {
  try {
    const cardsRef = collection(db, 'users', userId, 'cards');
    const snapshot = await getDocs(cardsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting cards:", error);
    throw error;
  }
};

export const deleteCard = async (userId, cardId) => {
  try {
    const cardRef = doc(db, 'users', userId, 'cards', cardId);
    await deleteDoc(cardRef);
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};

// Firestore functions for expenses
export const saveExpense = async (userId, expense) => {
  try {
    const expenseRef = doc(db, 'users', userId, 'expenses', expense.id);
    await setDoc(expenseRef, expense);
    return expense;
  } catch (error) {
    console.error("Error saving expense:", error);
    throw error;
  }
};

export const getExpenses = async (userId) => {
  try {
    const expensesRef = collection(db, 'users', userId, 'expenses');
    const snapshot = await getDocs(expensesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting expenses:", error);
    throw error;
  }
};

export const deleteExpense = async (userId, expenseId) => {
  try {
    const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

// User profile functions
export const saveUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Email/Password Authentication
export const signUpWithEmail = async (email, password, name) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user profile to Firestore
    const userData = {
      uid: user.uid,
      name: name,
      email: user.email,
      memberSince: new Date().toISOString().split('T')[0],
      creditScore: null, // No credit score for new users
      hasSeenTour: false,
      createdAt: new Date().toISOString()
    };

    await saveUserProfile(user.uid, userData);

    return { user, userData };
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userData = await getUserProfile(user.uid);

    return { user, userData };
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

// Card Reviews functions
export const saveCardReview = async (cardId, review) => {
  try {
    const reviewRef = doc(db, 'cardReviews', cardId, 'reviews', review.id);
    await setDoc(reviewRef, {
      ...review,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return review;
  } catch (error) {
    console.error("Error saving card review:", error);
    throw error;
  }
};

export const getCardReviews = async (cardId) => {
  try {
    const reviewsRef = collection(db, 'cardReviews', cardId, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting card reviews:", error);
    throw error;
  }
};

export const updateReviewHelpful = async (cardId, reviewId, helpfulCount) => {
  try {
    const reviewRef = doc(db, 'cardReviews', cardId, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      helpful: helpfulCount,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating review helpful count:", error);
    throw error;
  }
};

// Recommendation Comments functions
export const saveRecommendationComment = async (comment) => {
  try {
    const commentRef = doc(db, 'recommendationComments', comment.id);
    await setDoc(commentRef, {
      ...comment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return comment;
  } catch (error) {
    console.error("Error saving recommendation comment:", error);
    throw error;
  }
};

export const getRecommendationComments = async (category, amount) => {
  try {
    const commentsRef = collection(db, 'recommendationComments');
    const q = query(
      commentsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting recommendation comments:", error);
    // Return empty array if no comments found
    return [];
  }
};

export const updateCommentLikes = async (commentId, likes) => {
  try {
    const commentRef = doc(db, 'recommendationComments', commentId);
    await updateDoc(commentRef, {
      likes: likes,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating comment likes:", error);
    throw error;
  }
};

// Storage functions for file uploads
export const uploadExpensePDF = async (userId, expenseId, file) => {
  try {
    const storageRef = ref(storage, `expenses/${userId}/${expenseId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

export const deleteExpensePDF = async (userId, expenseId, fileName) => {
  try {
    const storageRef = ref(storage, `expenses/${userId}/${expenseId}/${fileName}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting PDF:", error);
    throw error;
  }
};
