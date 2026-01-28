const prisma = require('../utils/prisma');

/**
 * Recommendation Service - Core logic for calculating best card recommendations
 * Based on Section 7 of database.md
 */

class RecommendationService {
  /**
   * Get best card recommendation for an expense
   * @param {number} userId - User ID
   * @param {number} categoryId - Expense category ID
   * @param {number} amount - Expense amount
   * @param {string|null} merchant - Optional merchant name
   * @returns {Object} Recommendation result with best card and explanation
   */
  async getRecommendation(userId, categoryId, amount, merchant = null) {
    // Step 1: Fetch user's active cards
    const userCards = await prisma.userCard.findMany({
      where: { userId },
      include: {
        card: {
          include: {
            bank: true,
            cashbackRules: {
              where: {
                categoryId,
                active: true,
                OR: [
                  { startDate: null },
                  { startDate: { lte: new Date() } }
                ]
              },
              include: {
                exclusions: true
              }
            }
          }
        }
      }
    });

    if (userCards.length === 0) {
      return {
        success: false,
        message: 'No cards found for user',
        recommendation: null
      };
    }

    // Step 2: Calculate cashback for each card
    const cardRewards = [];

    for (const userCard of userCards) {
      const card = userCard.card;

      if (!card.active) continue;

      for (const rule of card.cashbackRules) {
        // Validate date range
        if (rule.endDate && new Date() > rule.endDate) continue;

        // Check transaction amount limits
        if (rule.minTxnAmount && amount < parseFloat(rule.minTxnAmount)) continue;
        if (rule.maxTxnAmount && amount > parseFloat(rule.maxTxnAmount)) continue;

        // Check minimum spend requirement
        if (rule.minSpend && amount < parseFloat(rule.minSpend)) continue;

        // Check exclusions
        const isExcluded = rule.exclusions.some(exclusion => {
          if (exclusion.excludedMerchant && merchant) {
            return merchant.toLowerCase().includes(exclusion.excludedMerchant.toLowerCase());
          }
          return false;
        });

        if (isExcluded) continue;

        // Calculate reward using the formula from database.md
        // reward = MIN(amount × reward_percent / 100, max_reward)
        const calculatedReward = amount * parseFloat(rule.cashbackPercent) / 100;
        const maxReward = rule.maxCashback ? parseFloat(rule.maxCashback) : Infinity;
        const finalReward = Math.min(calculatedReward, maxReward);

        cardRewards.push({
          card: {
            id: card.id,
            name: card.cardName,
            bank: card.bank.name,
            network: card.cardNetwork,
            last4Digits: userCard.last4Digits
          },
          rule: {
            id: rule.id,
            rewardType: rule.rewardType,
            rewardPercent: parseFloat(rule.cashbackPercent),
            maxReward: rule.maxCashback ? parseFloat(rule.maxCashback) : null,
            rewardCycle: rule.rewardCycle
          },
          reward: Math.round(finalReward * 100) / 100, // Round to 2 decimal places
          explanation: this.generateExplanation(card, rule, finalReward, amount)
        });
      }
    }

    // Step 3: Rank cards by net benefit (highest reward first)
    cardRewards.sort((a, b) => b.reward - a.reward);

    if (cardRewards.length === 0) {
      return {
        success: true,
        message: 'No applicable cashback rules found for this category',
        recommendation: null,
        allOptions: []
      };
    }

    // Return best card recommendation
    return {
      success: true,
      bestCard: cardRewards[0].card.name,
      bank: cardRewards[0].card.bank,
      reward: cardRewards[0].reward,
      rewardType: cardRewards[0].rule.rewardType,
      explanation: cardRewards[0].explanation,
      recommendation: cardRewards[0],
      allOptions: cardRewards
    };
  }

  /**
   * Generate human-readable explanation for the recommendation
   */
  generateExplanation(card, rule, reward, amount) {
    const rewardType = rule.rewardType === 'waiver' ? 'surcharge waiver' :
                       rule.rewardType === 'points' ? 'reward points' : 'cashback';

    let explanation = `${parseFloat(rule.cashbackPercent)}% ${rewardType}`;

    if (rule.maxCashback) {
      explanation += ` (max ₹${parseFloat(rule.maxCashback)})`;
    }

    if (rule.rewardCycle) {
      explanation += ` per ${rule.rewardCycle}`;
    }

    return explanation;
  }

  /**
   * Get all applicable cards for a category (without user context)
   */
  async getCardsForCategory(categoryId) {
    const rules = await prisma.cardCashbackRule.findMany({
      where: {
        categoryId,
        active: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      include: {
        card: {
          include: { bank: true }
        },
        exclusions: true
      },
      orderBy: {
        cashbackPercent: 'desc'
      }
    });

    return rules.map(rule => ({
      card: {
        id: rule.card.id,
        name: rule.card.cardName,
        bank: rule.card.bank.name,
        network: rule.card.cardNetwork
      },
      rewardPercent: parseFloat(rule.cashbackPercent),
      rewardType: rule.rewardType,
      maxReward: rule.maxCashback ? parseFloat(rule.maxCashback) : null,
      minTxn: rule.minTxnAmount ? parseFloat(rule.minTxnAmount) : null,
      maxTxn: rule.maxTxnAmount ? parseFloat(rule.maxTxnAmount) : null,
      exclusions: rule.exclusions.map(e => e.exclusionType)
    }));
  }
}

module.exports = new RecommendationService();
