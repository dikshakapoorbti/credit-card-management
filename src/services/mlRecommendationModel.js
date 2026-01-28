/**
 * ML-based Card Recommendation Model
 * Uses machine learning principles to recommend the best credit card
 * Based on historical data, spending patterns, and reward optimization
 */

class CardRecommendationML {
  constructor() {
    this.weights = {
      rewardRate: 0.35,
      categoryMatch: 0.25,
      utilization: 0.20,
      spendingHistory: 0.10,
      availableCredit: 0.05,
      dueDate: 0.05
    };

    // Training data from user's historical transactions
    this.trainingData = [];
    this.categoryPreferences = {};
  }

  /**
   * Train the model with user's historical spending data
   * @param {Array} expenses - Historical expense data
   * @param {Array} cards - User's credit cards
   */
  train(expenses, cards) {
    // Analyze spending patterns
    this.analyzeSpendingPatterns(expenses);

    // Build category preferences based on frequency and amounts
    this.buildCategoryPreferences(expenses);

    // Calculate optimal reward strategies
    this.optimizeRewardStrategies(expenses, cards);

    // Update model weights based on user behavior
    this.updateWeights(expenses);
  }

  /**
   * Analyze spending patterns to identify trends
   */
  analyzeSpendingPatterns(expenses) {
    const patterns = {
      byCategory: {},
      byMerchant: {},
      byDayOfWeek: {},
      byTimeOfMonth: {}
    };

    expenses.forEach(expense => {
      // Category analysis
      if (!patterns.byCategory[expense.category]) {
        patterns.byCategory[expense.category] = {
          count: 0,
          totalAmount: 0,
          avgAmount: 0
        };
      }
      patterns.byCategory[expense.category].count++;
      patterns.byCategory[expense.category].totalAmount += expense.amount;
      patterns.byCategory[expense.category].avgAmount =
        patterns.byCategory[expense.category].totalAmount /
        patterns.byCategory[expense.category].count;

      // Merchant analysis
      if (!patterns.byMerchant[expense.merchant]) {
        patterns.byMerchant[expense.merchant] = {
          count: 0,
          preferredCard: null
        };
      }
      patterns.byMerchant[expense.merchant].count++;
    });

    this.trainingData = patterns;
    return patterns;
  }

  /**
   * Build category preferences based on spending frequency
   */
  buildCategoryPreferences(expenses) {
    const totalExpenses = expenses.length;
    const categoryFrequency = {};

    expenses.forEach(expense => {
      categoryFrequency[expense.category] =
        (categoryFrequency[expense.category] || 0) + 1;
    });

    // Calculate preference scores (0-1)
    Object.keys(categoryFrequency).forEach(category => {
      this.categoryPreferences[category] =
        categoryFrequency[category] / totalExpenses;
    });
  }

  /**
   * Optimize reward strategies based on historical data
   */
  optimizeRewardStrategies(expenses, cards) {
    const cardPerformance = {};

    cards.forEach(card => {
      const cardExpenses = expenses.filter(e => e.cardId === card.id);
      const totalRewards = cardExpenses.reduce((sum, e) =>
        sum + (e.rewardsEarned || 0), 0);

      cardPerformance[card.id] = {
        totalRewards,
        transactionCount: cardExpenses.length,
        avgRewardPerTransaction: cardExpenses.length > 0
          ? totalRewards / cardExpenses.length
          : 0
      };
    });

    this.cardPerformance = cardPerformance;
  }

  /**
   * Update model weights based on user behavior
   * Uses gradient descent-like approach
   */
  updateWeights(expenses) {
    if (expenses.length < 10) return; // Not enough data

    // Analyze which factors led to better rewards
    const categoryImpact = this.calculateCategoryImpact(expenses);
    const utilizationImpact = this.calculateUtilizationImpact(expenses);

    // Adjust weights (simple learning rate = 0.1)
    const learningRate = 0.1;

    if (categoryImpact > 0.7) {
      this.weights.categoryMatch += learningRate * 0.1;
      this.weights.rewardRate -= learningRate * 0.05;
    }

    if (utilizationImpact > 0.6) {
      this.weights.utilization += learningRate * 0.1;
      this.weights.rewardRate -= learningRate * 0.05;
    }

    // Normalize weights to sum to 1
    this.normalizeWeights();
  }

  /**
   * Calculate category matching impact on rewards
   */
  calculateCategoryImpact(expenses) {
    const highRewardExpenses = expenses
      .filter(e => e.rewardsEarned > e.amount * 0.03);

    const categoricalExpenses = highRewardExpenses.filter(e =>
      e.category !== 'Others'
    );

    return categoricalExpenses.length / highRewardExpenses.length;
  }

  /**
   * Calculate utilization impact
   */
  calculateUtilizationImpact(expenses) {
    // Simplified calculation
    return 0.5; // Placeholder
  }

  /**
   * Normalize weights to sum to 1
   */
  normalizeWeights() {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    Object.keys(this.weights).forEach(key => {
      this.weights[key] /= sum;
    });
  }

  /**
   * Predict best card for a given expense using ML model
   * @param {Array} cards - Available credit cards
   * @param {Object} expense - Expense details {category, amount}
   * @returns {Array} Ranked card recommendations
   */
  predict(cards, expense) {
    const { category, amount } = expense;

    const predictions = cards.map(card => {
      // Feature extraction
      const features = this.extractFeatures(card, category, amount);

      // Calculate prediction score
      const score = this.calculateMLScore(features);

      // Get confidence level
      const confidence = this.calculateConfidence(features, score);

      return {
        card,
        score,
        confidence,
        features,
        reason: this.generateMLReason(features, score)
      };
    });

    // Sort by score (descending)
    return predictions.sort((a, b) => b.score - a.score);
  }

  /**
   * Extract features for ML model
   */
  extractFeatures(card, category, amount) {
    // Get reward rate for category
    const rewardRate = this.getRewardRate(card, category);

    // Category match score
    const categoryMatch = this.getCategoryMatchScore(card, category);

    // Utilization after transaction
    const newUtilization = (card.currentBalance + amount) / card.creditLimit;
    const utilizationScore = Math.max(0, 1 - newUtilization);

    // Historical performance
    const historicalScore = this.cardPerformance?.[card.id]?.avgRewardPerTransaction || 0;

    // Available credit sufficiency
    const creditScore = card.availableCredit >= amount ? 1 : 0;

    // Days until due
    const daysUntilDue = this.getDaysUntilDue(card.dueDate);
    const dueDateScore = Math.min(1, daysUntilDue / 30);

    return {
      rewardRate,
      categoryMatch,
      utilizationScore,
      historicalScore,
      creditScore,
      dueDateScore
    };
  }

  /**
   * Calculate ML-based score using weighted features
   */
  calculateMLScore(features) {
    return (
      features.rewardRate * this.weights.rewardRate +
      features.categoryMatch * this.weights.categoryMatch +
      features.utilizationScore * this.weights.utilization +
      features.historicalScore * this.weights.spendingHistory +
      features.creditScore * this.weights.availableCredit +
      features.dueDateScore * this.weights.dueDate
    ) * 100;
  }

  /**
   * Calculate confidence level of prediction
   */
  calculateConfidence(features, score) {
    // Higher confidence if multiple strong features
    const strongFeatures = Object.values(features)
      .filter(f => f > 0.7).length;

    const confidence = Math.min(0.95, (strongFeatures / 6) * 0.8 + 0.2);
    return Math.round(confidence * 100);
  }

  /**
   * Generate ML-based reasoning
   */
  generateMLReason(features, score) {
    const reasons = [];

    if (features.rewardRate > 0.7) {
      reasons.push('🎯 High reward rate for this category');
    }
    if (features.categoryMatch > 0.8) {
      reasons.push('✨ Perfect category match');
    }
    if (features.utilizationScore > 0.7) {
      reasons.push('📊 Optimal credit utilization');
    }
    if (features.historicalScore > 0.5) {
      reasons.push('📈 Strong historical performance');
    }

    return reasons.join(' • ') || 'Good overall match';
  }

  // Helper methods
  getRewardRate(card, category) {
    if (!card.rewards?.categories) return 0;

    const rate = card.rewards.categories[category] ||
                 card.rewards.categories['Others'] ||
                 card.rewards.pointsPerRupee || 0;

    // Normalize to 0-1 scale (assuming max rate is 10)
    return Math.min(1, rate / 10);
  }

  getCategoryMatchScore(card, category) {
    const categoryPref = this.categoryPreferences[category] || 0.5;
    const hasCategory = card.rewards?.categories?.[category] > 0;

    return hasCategory ? categoryPref : categoryPref * 0.5;
  }

  getDaysUntilDue(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get model statistics and performance
   */
  getModelStats() {
    return {
      weights: this.weights,
      trainingDataSize: Object.keys(this.trainingData).length,
      categoryPreferences: this.categoryPreferences,
      cardPerformance: this.cardPerformance
    };
  }
}

// Singleton instance
const mlModel = new CardRecommendationML();

export default mlModel;
