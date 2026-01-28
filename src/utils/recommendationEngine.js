/**
 * Smart recommendation engine to suggest the best credit card for a given expense
 */

export const getBestCardRecommendation = (cards, category, amount) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  const recommendations = cards
    .filter(card => card.availableCredit >= amount)
    .map(card => {
      // Enhanced: Check for offer-based benefits first
      const offerBenefit = calculateOfferBenefit(card, category, amount);
      const fallbackRewardRate = getRewardRate(card, category);
      const fallbackRewardValue = calculateRewardValue(card, amount, fallbackRewardRate);

      // Use offer benefit if available, otherwise use standard rewards
      const actualBenefit = offerBenefit.benefit > 0 ? offerBenefit.benefit : fallbackRewardValue;
      const benefitType = offerBenefit.benefit > 0 ? offerBenefit.type : card.rewards?.type || 'Reward Points';

      const utilizationAfter = ((card.currentBalance + amount) / card.creditLimit) * 100;

      // Enhanced scoring system
      let score = 0;

      // Benefit value (50% weight) - increased from 40% to prioritize high-value offers
      score += (actualBenefit / amount) * 50;

      // Offer bonus (10% weight) - extra points if there's an active offer
      if (offerBenefit.hasOffer) {
        score += 10;
      }

      // Credit utilization (25% weight) - reduced from 30%
      const utilizationScore = Math.max(0, 25 - (utilizationAfter * 0.25));
      score += utilizationScore;

      // Available credit (10% weight) - reduced from 20%
      const availableCreditScore = (card.availableCredit / card.creditLimit) * 10;
      score += availableCreditScore;

      // Days until due date (5% weight) - reduced from 10%
      const daysUntilDue = getDaysUntilDue(card.dueDate);
      const dueScore = Math.min(5, daysUntilDue / 6);
      score += dueScore;

      return {
        card,
        score,
        rewardValue: actualBenefit,
        benefitType,
        rewardRate: offerBenefit.hasOffer ? offerBenefit.rate : fallbackRewardRate,
        utilizationAfter,
        daysUntilDue,
        hasOffer: offerBenefit.hasOffer,
        offerDetails: offerBenefit.offer,
        reason: generateEnhancedReason(card, category, actualBenefit, benefitType, utilizationAfter, offerBenefit)
      };
    })
    .sort((a, b) => b.score - a.score);

  return recommendations;
};

const getRewardRate = (card, category) => {
  if (!card.rewards || !card.rewards.categories) {
    return card.rewards?.pointsPerRupee || 0;
  }

  // Check for exact category match
  if (card.rewards.categories[category]) {
    return card.rewards.categories[category];
  }

  // Check for partial matches
  const categoryLower = category.toLowerCase();
  for (const [cat, rate] of Object.entries(card.rewards.categories)) {
    if (cat.toLowerCase().includes(categoryLower) || categoryLower.includes(cat.toLowerCase())) {
      return rate;
    }
  }

  // Return default rate
  return card.rewards.categories['Others'] || card.rewards.pointsPerRupee || 0;
};

const calculateRewardValue = (card, amount, rewardRate) => {
  if (!card.rewards) return 0;

  if (card.rewards.type === 'Cashback') {
    return amount * (rewardRate / 100);
  } else if (card.rewards.type === 'Reward Points' || card.rewards.type === 'Airline Miles') {
    // Assuming 1 point = ₹0.25 value
    const points = amount * rewardRate;
    return points * 0.25;
  }

  return 0;
};

const getDaysUntilDue = (dueDate) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const analyzeSpendingPattern = (expenses, cards) => {
  const categorySpending = {};
  const monthlySpending = {};
  let totalSpending = 0;

  expenses.forEach(expense => {
    // Category analysis
    if (!categorySpending[expense.category]) {
      categorySpending[expense.category] = 0;
    }
    categorySpending[expense.category] += expense.amount;

    // Monthly analysis
    const month = expense.date.substring(0, 7); // YYYY-MM
    if (!monthlySpending[month]) {
      monthlySpending[month] = 0;
    }
    monthlySpending[month] += expense.amount;

    totalSpending += expense.amount;
  });

  // Sort categories by spending
  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalSpending) * 100
    }));

  return {
    totalSpending,
    categorySpending,
    monthlySpending,
    topCategories,
    averageTransaction: expenses.length > 0 ? totalSpending / expenses.length : 0
  };
};

export const getCreditUtilizationInsights = (cards) => {
  let totalLimit = 0;
  let totalUsed = 0;

  cards.forEach(card => {
    totalLimit += card.creditLimit;
    totalUsed += card.currentBalance;
  });

  const utilizationPercentage = (totalUsed / totalLimit) * 100;

  let status = 'Excellent';
  let color = '#10b981';
  let recommendation = 'Your credit utilization is healthy. Keep it up!';

  if (utilizationPercentage > 70) {
    status = 'High';
    color = '#ef4444';
    recommendation = 'Consider paying down your balances to improve your credit score.';
  } else if (utilizationPercentage > 50) {
    status = 'Moderate';
    color = '#f59e0b';
    recommendation = 'Try to keep your utilization below 30% for optimal credit health.';
  } else if (utilizationPercentage > 30) {
    status = 'Good';
    color = '#3b82f6';
    recommendation = 'Your utilization is acceptable, but could be better.';
  }

  return {
    totalLimit,
    totalUsed,
    utilizationPercentage,
    status,
    color,
    recommendation
  };
};

export const getUpcomingDues = (cards) => {
  return cards
    .filter(card => card.currentBalance > 0)
    .map(card => ({
      ...card,
      daysUntilDue: getDaysUntilDue(card.dueDate)
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

/**
 * Enhanced: Calculate offer-based benefits
 */
const calculateOfferBenefit = (card, category, amount) => {
  // Check if card has offers
  if (!card.offers || card.offers.length === 0) {
    return { benefit: 0, hasOffer: false, type: null, rate: 0, offer: null };
  }

  // Find matching offer for the category
  const matchingOffer = card.offers.find(offer =>
    offer.category.toLowerCase() === category.toLowerCase()
  );

  if (!matchingOffer) {
    return { benefit: 0, hasOffer: false, type: null, rate: 0, offer: null };
  }

  // Check minimum transaction requirement
  if (matchingOffer.minTransaction && amount < matchingOffer.minTransaction) {
    return { benefit: 0, hasOffer: false, type: null, rate: 0, offer: matchingOffer };
  }

  // Check if offer is still valid
  if (matchingOffer.validTill) {
    const validDate = new Date(matchingOffer.validTill);
    const today = new Date();
    if (today > validDate) {
      return { benefit: 0, hasOffer: false, type: null, rate: 0, offer: null };
    }
  }

  let benefit = 0;
  let benefitType = '';
  let rate = 0;

  // Calculate cashback benefit
  if (matchingOffer.cashbackPercent && matchingOffer.cashbackPercent > 0) {
    benefit = (amount * matchingOffer.cashbackPercent) / 100;

    // Apply max benefit cap if specified
    if (matchingOffer.maxBenefit && benefit > matchingOffer.maxBenefit) {
      benefit = matchingOffer.maxBenefit;
    }

    benefitType = 'Cashback';
    rate = matchingOffer.cashbackPercent;
  }
  // Calculate reward points benefit
  else if (matchingOffer.rewardPointsMultiplier && matchingOffer.rewardPointsMultiplier > 0) {
    const basePoints = card.rewards?.pointsPerRupee || 1;
    const totalPoints = amount * basePoints * matchingOffer.rewardPointsMultiplier;

    // Convert points to rupees (assuming 1 point = ₹0.25)
    benefit = totalPoints * 0.25;

    // Apply max benefit cap if specified (in rupees)
    if (matchingOffer.maxBenefit) {
      const maxPoints = matchingOffer.maxBenefit / 0.25;
      if (totalPoints > maxPoints) {
        benefit = matchingOffer.maxBenefit;
      }
    }

    benefitType = card.rewards?.type || 'Reward Points';
    rate = matchingOffer.rewardPointsMultiplier;
  }

  return {
    benefit,
    hasOffer: benefit > 0,
    type: benefitType,
    rate,
    offer: matchingOffer
  };
};

/**
 * Enhanced: Generate detailed reason with offer information
 */
const generateEnhancedReason = (card, category, benefit, benefitType, utilization, offerBenefit) => {
  const reasons = [];

  // Highlight active offers
  if (offerBenefit.hasOffer && offerBenefit.offer) {
    if (benefitType === 'Cashback') {
      reasons.push(`🎁 ${offerBenefit.rate}% cashback on ${category}`);
    } else {
      reasons.push(`🎁 ${offerBenefit.rate}X points on ${category}`);
    }
  }

  // Show expected benefit
  if (benefit > 0) {
    if (benefitType === 'Cashback') {
      reasons.push(`💰 Earn ₹${Math.round(benefit)} cashback`);
    } else {
      const points = Math.round(benefit / 0.25);
      reasons.push(`⭐ Earn ${points.toLocaleString()} points (₹${Math.round(benefit)} value)`);
    }
  }

  // Utilization insight
  if (utilization < 30) {
    reasons.push(`📊 Healthy utilization (${utilization.toFixed(1)}%)`);
  } else if (utilization > 70) {
    reasons.push(`⚠️ High utilization (${utilization.toFixed(1)}%)`);
  }

  if (reasons.length === 0) {
    reasons.push(`💳 Credit available`);
  }

  return reasons.join(' • ');
};
