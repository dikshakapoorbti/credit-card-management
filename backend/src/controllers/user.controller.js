const prisma = require('../utils/prisma');

/**
 * User Controller - Handles all user-related API requests
 * Based on Section 17.2 of database.md
 */

// ==================== USER MANAGEMENT ====================

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, firebaseUid } = req.body;

    const user = await prisma.user.create({
      data: { name, email, phone, firebaseUid }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    next(error);
  }
};

exports.getUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userCards: {
          include: {
            card: { include: { bank: true } }
          }
        },
        _count: { select: { expenses: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getUserByFirebaseUid = async (req, res, next) => {
  try {
    const { firebaseUid } = req.params;

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        userCards: {
          include: {
            card: { include: { bank: true } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ==================== USER CARDS MANAGEMENT ====================

exports.addUserCard = async (req, res, next) => {
  try {
    const { userId, cardId, last4Digits, linkedPhone } = req.body;

    // Check if card exists and is active
    const card = await prisma.creditCard.findUnique({
      where: { id: parseInt(cardId) }
    });

    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    if (!card.active) {
      return res.status(400).json({ success: false, error: 'This card is no longer available' });
    }

    const userCard = await prisma.userCard.create({
      data: {
        userId: parseInt(userId),
        cardId: parseInt(cardId),
        last4Digits,
        linkedPhone,
        verified: false // Will be verified via OTP later
      },
      include: {
        card: { include: { bank: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Card added to your wallet',
      data: userCard
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'You already have this card in your wallet'
      });
    }
    next(error);
  }
};

exports.getUserCards = async (req, res, next) => {
  try {
    const { userId } = req.params;

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
      },
      orderBy: { addedAt: 'desc' }
    });

    res.json({ success: true, data: userCards });
  } catch (error) {
    next(error);
  }
};

exports.removeUserCard = async (req, res, next) => {
  try {
    const { userId, cardId } = req.params;

    await prisma.userCard.delete({
      where: {
        userId_cardId: {
          userId: parseInt(userId),
          cardId: parseInt(cardId)
        }
      }
    });

    res.json({ success: true, message: 'Card removed from your wallet' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Card not found in your wallet' });
    }
    next(error);
  }
};

exports.verifyUserCard = async (req, res, next) => {
  try {
    const { userId, cardId } = req.params;

    // In production, this would verify OTP from bank aggregator
    // For now, we'll just mark it as verified

    const userCard = await prisma.userCard.update({
      where: {
        userId_cardId: {
          userId: parseInt(userId),
          cardId: parseInt(cardId)
        }
      },
      data: { verified: true }
    });

    res.json({
      success: true,
      message: 'Card verified successfully',
      data: userCard
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER EXPENSES ====================

exports.addExpense = async (req, res, next) => {
  try {
    const { userId, categoryId, amount, merchant, expenseDate } = req.body;

    const expense = await prisma.userExpense.create({
      data: {
        userId: parseInt(userId),
        categoryId: parseInt(categoryId),
        amount,
        merchant,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date()
      },
      include: { category: true }
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserExpenses = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, categoryId, limit = 50 } = req.query;

    const where = { userId: parseInt(userId) };

    if (categoryId) where.categoryId = parseInt(categoryId);
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const expenses = await prisma.userExpense.findMany({
      where,
      include: { category: true },
      orderBy: { expenseDate: 'desc' },
      take: parseInt(limit)
    });

    // Calculate totals by category
    const totals = await prisma.userExpense.groupBy({
      by: ['categoryId'],
      where: { userId: parseInt(userId) },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        expenses,
        totals
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpenseSummary = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const summary = await prisma.userExpense.groupBy({
      by: ['categoryId'],
      where: {
        userId: parseInt(userId),
        expenseDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: { amount: true },
      _count: true
    });

    // Get category names
    const categories = await prisma.category.findMany();
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const result = summary.map(s => ({
      category: categoryMap[s.categoryId],
      categoryId: s.categoryId,
      totalAmount: s._sum.amount,
      transactionCount: s._count
    }));

    const totalSpend = result.reduce((sum, r) => sum + parseFloat(r.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        month: startDate.toLocaleString('default', { month: 'long' }),
        year: startDate.getFullYear(),
        totalSpend,
        byCategory: result
      }
    });
  } catch (error) {
    next(error);
  }
};
