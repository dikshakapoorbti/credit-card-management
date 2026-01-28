import axios from 'axios';

// API base URL - Update this with your actual API endpoint
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.yourdomain.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Check card balance using external API
 * @param {Object} cardDetails - Card information
 * @returns {Promise} Balance information
 */
export const checkCardBalance = async (cardDetails) => {
  try {
    // Mock implementation - Replace with actual API call
    // const response = await apiClient.post('/api/check-balance', {
    //   cardNumber: cardDetails.lastFourDigits,
    //   cardId: cardDetails.id
    // });

    // Mock response for demo
    return {
      success: true,
      data: {
        currentBalance: cardDetails.currentBalance,
        availableCredit: cardDetails.availableCredit,
        creditLimit: cardDetails.creditLimit,
        lastUpdated: new Date().toISOString(),
        recentTransactions: [
          {
            id: 't1',
            merchant: 'Amazon',
            amount: 2500,
            date: new Date().toISOString(),
            status: 'posted'
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    throw error;
  }
};

/**
 * Verify transaction with bank API
 * @param {Object} transactionData - Transaction details
 * @returns {Promise} Verification result
 */
export const verifyTransaction = async (transactionData) => {
  try {
    // Mock implementation
    return {
      success: true,
      verified: true,
      transactionId: `txn_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
};

/**
 * Get real-time card offers and benefits
 * @param {string} cardId - Card ID
 * @returns {Promise} Offers data
 */
export const getCardOffers = async (cardId) => {
  try {
    return {
      success: true,
      offers: [
        {
          id: 'offer1',
          title: '10% cashback on dining',
          description: 'Get extra cashback this month',
          validUntil: '2025-12-31',
          category: 'Dining'
        }
      ]
    };
  } catch (error) {
    console.error('Error getting offers:', error);
    throw error;
  }
};

/**
 * Sync card data with bank
 * @param {string} userId - User ID
 * @param {Object} cardData - Card data to sync
 * @returns {Promise} Sync result
 */
export const syncCardData = async (userId, cardData) => {
  try {
    // This would integrate with actual bank APIs
    // For now, returning mock data
    return {
      success: true,
      syncedAt: new Date().toISOString(),
      message: 'Card data synced successfully'
    };
  } catch (error) {
    console.error('Error syncing card data:', error);
    throw error;
  }
};

export default apiClient;
