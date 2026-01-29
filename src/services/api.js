/**
 * API Service - Connects React frontend to PostgreSQL backend
 * Replaces Firestore data operations while keeping Firebase Auth
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // ==================== USER APIs ====================

  async createUser(userData) {
    return this.request('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserByEmail(email) {
    return this.request(`/user/email/${encodeURIComponent(email)}`);
  }

  async getUserByFirebaseUid(firebaseUid) {
    return this.request(`/user/firebase/${firebaseUid}`);
  }

  async getOrCreateUser(firebaseUser) {
    try {
      // Try to get existing user
      const response = await this.getUserByFirebaseUid(firebaseUser.uid);
      return response.data;
    } catch (error) {
      // User doesn't exist, create new one
      const newUser = await this.createUser({
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        phone: firebaseUser.phoneNumber || null,
        firebaseUid: firebaseUser.uid,
      });
      return newUser.data;
    }
  }

  // ==================== USER CARDS APIs ====================

  async getUserCards(userId) {
    const response = await this.request(`/user/${userId}/cards`);
    return response.data;
  }

  async addUserCard(userId, cardId, last4Digits) {
    return this.request('/user/cards', {
      method: 'POST',
      body: JSON.stringify({ userId, cardId, last4Digits }),
    });
  }

  async removeUserCard(userId, cardId) {
    return this.request(`/user/${userId}/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // ==================== EXPENSES APIs ====================

  async getUserExpenses(userId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.limit) params.append('limit', filters.limit);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request(`/user/${userId}/expenses${query}`);
    return response.data;
  }

  async addExpense(userId, expenseData) {
    return this.request('/user/expenses', {
      method: 'POST',
      body: JSON.stringify({ userId, ...expenseData }),
    });
  }

  async getExpenseSummary(userId, month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request(`/user/${userId}/expenses/summary${query}`);
    return response.data;
  }

  // ==================== RECOMMENDATION APIs ====================

  async getRecommendation(userId, categoryId, amount, merchant = null) {
    const response = await this.request('/recommendation', {
      method: 'POST',
      body: JSON.stringify({ userId, categoryId, amount, merchant }),
    });
    return response;
  }

  async compareCards(userId, categoryId, amount) {
    const response = await this.request('/recommendation/compare', {
      method: 'POST',
      body: JSON.stringify({ userId, categoryId, amount }),
    });
    return response;
  }

  async getBestCardsByCategory(userId) {
    const response = await this.request(`/recommendation/user/${userId}/best-cards`);
    return response.data;
  }

  async getCardsForCategory(categoryId) {
    const response = await this.request(`/recommendation/category/${categoryId}`);
    return response.data;
  }

  // ==================== ADMIN APIs (Categories, Cards, Banks) ====================

  async getAllCategories() {
    const response = await this.request('/admin/categories');
    return response.data;
  }

  async getAllBanks() {
    const response = await this.request('/admin/banks');
    return response.data;
  }

  async getAllCreditCards(filters = {}) {
    const params = new URLSearchParams();
    if (filters.bankId) params.append('bankId', filters.bankId);
    if (filters.active !== undefined) params.append('active', filters.active);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request(`/admin/credit-cards${query}`);
    return response.data;
  }

  async getCreditCardById(cardId) {
    const response = await this.request(`/admin/credit-cards/${cardId}`);
    return response.data;
  }

  async getCashbackRules(filters = {}) {
    const params = new URLSearchParams();
    if (filters.cardId) params.append('cardId', filters.cardId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request(`/admin/cashback-rules${query}`);
    return response.data;
  }
}

// Export singleton instance
const api = new ApiService();
export default api;

// Also export class for testing
export { ApiService };
