const prisma = require('../utils/prisma');

/**
 * Admin Controller - Handles all admin portal API requests
 * Based on Section 8 & 17.1 of database.md
 */

// ==================== BANK MANAGEMENT ====================

exports.createBank = async (req, res, next) => {
  try {
    const { name, logoUrl, apiIdentifier } = req.body;

    const bank = await prisma.bank.create({
      data: { name, logoUrl, apiIdentifier }
    });

    res.status(201).json({
      success: true,
      message: 'Bank created successfully',
      data: bank
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Bank with this name already exists'
      });
    }
    next(error);
  }
};

exports.getAllBanks = async (req, res, next) => {
  try {
    const banks = await prisma.bank.findMany({
      include: { _count: { select: { creditCards: true } } },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: banks });
  } catch (error) {
    next(error);
  }
};

exports.updateBank = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, apiIdentifier } = req.body;

    const bank = await prisma.bank.update({
      where: { id: parseInt(id) },
      data: { name, logoUrl, apiIdentifier }
    });

    res.json({ success: true, message: 'Bank updated', data: bank });
  } catch (error) {
    next(error);
  }
};

// ==================== CREDIT CARD MANAGEMENT ====================

exports.createCreditCard = async (req, res, next) => {
  try {
    const { bankId, cardName, cardNetwork, annualFee, feeWaiverSpend, active } = req.body;

    const card = await prisma.creditCard.create({
      data: {
        bankId: parseInt(bankId),
        cardName,
        cardNetwork,
        annualFee: annualFee || 0,
        feeWaiverSpend,
        active: active !== false
      },
      include: { bank: true }
    });

    res.status(201).json({
      success: true,
      message: 'Credit card created successfully',
      data: card
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'This card already exists for the specified bank'
      });
    }
    next(error);
  }
};

exports.getAllCreditCards = async (req, res, next) => {
  try {
    const { bankId, active } = req.query;

    const where = {};
    if (bankId) where.bankId = parseInt(bankId);
    if (active !== undefined) where.active = active === 'true';

    const cards = await prisma.creditCard.findMany({
      where,
      include: {
        bank: true,
        _count: { select: { cashbackRules: true, userCards: true } }
      },
      orderBy: [{ bank: { name: 'asc' } }, { cardName: 'asc' }]
    });

    res.json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
};

exports.getCreditCardById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const card = await prisma.creditCard.findUnique({
      where: { id: parseInt(id) },
      include: {
        bank: true,
        cashbackRules: {
          include: { category: true, exclusions: true }
        },
        feeRules: true
      }
    });

    if (!card) {
      return res.status(404).json({ success: false, error: 'Credit card not found' });
    }

    res.json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
};

exports.updateCreditCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cardName, cardNetwork, annualFee, feeWaiverSpend, active } = req.body;

    const card = await prisma.creditCard.update({
      where: { id: parseInt(id) },
      data: { cardName, cardNetwork, annualFee, feeWaiverSpend, active },
      include: { bank: true }
    });

    res.json({ success: true, message: 'Credit card updated', data: card });
  } catch (error) {
    next(error);
  }
};

exports.toggleCardStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const card = await prisma.creditCard.findUnique({ where: { id: parseInt(id) } });
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    const updated = await prisma.creditCard.update({
      where: { id: parseInt(id) },
      data: { active: !card.active }
    });

    res.json({
      success: true,
      message: `Card ${updated.active ? 'enabled' : 'disabled'}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CATEGORY MANAGEMENT ====================

exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;

    const category = await prisma.category.create({
      data: { name, icon }
    });

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: category
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Category already exists'
      });
    }
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// ==================== CASHBACK RULES MANAGEMENT ====================

exports.createCashbackRule = async (req, res, next) => {
  try {
    const {
      cardId,
      categoryId,
      rewardType,
      cashbackPercent,
      maxCashback,
      minSpend,
      minTxnAmount,
      maxTxnAmount,
      monthlyCap,
      rewardCycle,
      startDate,
      endDate
    } = req.body;

    const rule = await prisma.cardCashbackRule.create({
      data: {
        cardId: parseInt(cardId),
        categoryId: parseInt(categoryId),
        rewardType: rewardType || 'cashback',
        cashbackPercent,
        maxCashback,
        minSpend,
        minTxnAmount,
        maxTxnAmount,
        monthlyCap,
        rewardCycle,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        card: { include: { bank: true } },
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Cashback rule created',
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllCashbackRules = async (req, res, next) => {
  try {
    const { cardId, categoryId, active } = req.query;

    const where = {};
    if (cardId) where.cardId = parseInt(cardId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (active !== undefined) where.active = active === 'true';

    const rules = await prisma.cardCashbackRule.findMany({
      where,
      include: {
        card: { include: { bank: true } },
        category: true,
        exclusions: true
      },
      orderBy: { cashbackPercent: 'desc' }
    });

    res.json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

exports.updateCashbackRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert dates if provided
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const rule = await prisma.cardCashbackRule.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        card: { include: { bank: true } },
        category: true
      }
    });

    res.json({ success: true, message: 'Rule updated', data: rule });
  } catch (error) {
    next(error);
  }
};

exports.deleteCashbackRule = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.cardCashbackRule.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Cashback rule deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== EXCLUSIONS MANAGEMENT ====================

exports.addExclusion = async (req, res, next) => {
  try {
    const { cashbackRuleId, exclusionType, excludedMerchant } = req.body;

    const exclusion = await prisma.cashbackExclusion.create({
      data: {
        cashbackRuleId: parseInt(cashbackRuleId),
        exclusionType,
        excludedMerchant
      }
    });

    res.status(201).json({
      success: true,
      message: 'Exclusion added',
      data: exclusion
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExclusion = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.cashbackExclusion.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Exclusion deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== FEE RULES MANAGEMENT ====================

exports.createFeeRule = async (req, res, next) => {
  try {
    const { cardId, annualFee, joiningFee, feeWaiverSpend } = req.body;

    const rule = await prisma.cardFeeRule.create({
      data: {
        cardId: parseInt(cardId),
        annualFee,
        joiningFee,
        feeWaiverSpend
      },
      include: { card: true }
    });

    res.status(201).json({
      success: true,
      message: 'Fee rule created',
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeeRules = async (req, res, next) => {
  try {
    const { cardId } = req.query;

    const where = {};
    if (cardId) where.cardId = parseInt(cardId);

    const rules = await prisma.cardFeeRule.findMany({
      where,
      include: { card: { include: { bank: true } } }
    });

    res.json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};
