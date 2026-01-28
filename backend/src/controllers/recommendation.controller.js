const recommendationService = require('../services/recommendation.service');
const prisma = require('../utils/prisma');

/**
 * Recommendation Controller - Handles recommendation API requests
 * Based on Section 7 & 16 of database.md
 */

exports.getRecommendation = async (req, res, next) => {
  try {
    const { userId, categoryId, amount, merchant } = req.body;

    if (!userId || !categoryId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'userId, categoryId, and amount are required'
      });
    }

    const result = await recommendationService.getRecommendation(
      parseInt(userId),
      parseInt(categoryId),
      parseFloat(amount),
      merchant
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCardsForCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const cards = await recommendationService.getCardsForCategory(parseInt(categoryId));

    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

exports.compareCards = async (req, res, next) => {
  try {
    const { userId, categoryId, amount } = req.body;

    if (!userId || !categoryId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'userId, categoryId, and amount are required'
      });
    }

    const result = await recommendationService.getRecommendation(
      parseInt(userId),
      parseInt(categoryId),
      parseFloat(amount)
    );

    if (!result.success) {
      return res.json(result);
    }

    // Return all options for comparison
    res.json({
      success: true,
      category: await prisma.category.findUnique({ where: { id: parseInt(categoryId) } }),
      amount: parseFloat(amount),
      comparison: result.allOptions
    });
  } catch (error) {
    next(error);
  }
};

exports.getBestCardsByCategory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get all categories
    const categories = await prisma.category.findMany();

    // Get user's cards
    const userCards = await prisma.userCard.findMany({
      where: { userId: parseInt(userId) },
      include: {
        card: {
          include: {
            bank: true,
            cashbackRules: {
              where: { active: true },
              include: { category: true }
            }
          }
        }
      }
    });

    if (userCards.length === 0) {
      return res.json({
        success: true,
        message: 'No cards found for user',
        data: []
      });
    }

    // For each category, find the best card
    const bestCards = [];

    for (const category of categories) {
      let bestCard = null;
      let bestPercent = 0;

      for (const userCard of userCards) {
        const rule = userCard.card.cashbackRules.find(
          r => r.categoryId === category.id && r.active
        );

        if (rule && parseFloat(rule.cashbackPercent) > bestPercent) {
          bestPercent = parseFloat(rule.cashbackPercent);
          bestCard = {
            category: category.name,
            categoryId: category.id,
            card: {
              name: userCard.card.cardName,
              bank: userCard.card.bank.name,
              last4Digits: userCard.last4Digits
            },
            rewardPercent: bestPercent,
            rewardType: rule.rewardType,
            maxReward: rule.maxCashback ? parseFloat(rule.maxCashback) : null
          };
        }
      }

      if (bestCard) {
        bestCards.push(bestCard);
      }
    }

    res.json({
      success: true,
      data: bestCards
    });
  } catch (error) {
    next(error);
  }
};
