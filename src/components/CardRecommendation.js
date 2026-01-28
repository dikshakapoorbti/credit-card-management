import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import RecommendationComments from './RecommendationComments';
import './CardRecommendation.css';

const CardRecommendation = () => {
  const { cards } = useApp();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    merchant: ''
  });
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Dining',
    'Travel',
    'Shopping',
    'Online Shopping',
    'Groceries',
    'Utilities',
    'Fuel',
    'Entertainment',
    'Healthcare',
    'Education',
    'Bill Payments',
    'Amazon',
    'Others'
  ];

  const calculateBenefit = (card, amount, category) => {
    // Find applicable offer for this category
    const applicableOffer = card.offers?.find(offer => offer.category === category);

    let benefit = 0;
    let benefitType = '';
    let offerDescription = '';

    if (applicableOffer) {
      // Check minimum transaction
      if (amount < applicableOffer.minTransaction) {
        return {
          benefit: 0,
          benefitType: 'none',
          reason: `Minimum transaction ₹${applicableOffer.minTransaction} required`,
          offerDescription: applicableOffer.description
        };
      }

      if (applicableOffer.cashbackPercent > 0) {
        // Calculate cashback
        benefit = (amount * applicableOffer.cashbackPercent) / 100;

        // Apply max benefit cap
        if (applicableOffer.maxBenefit && benefit > applicableOffer.maxBenefit) {
          benefit = applicableOffer.maxBenefit;
        }

        benefitType = 'cashback';
        offerDescription = applicableOffer.description;
      } else if (applicableOffer.rewardPointsMultiplier > 0) {
        // Calculate reward points
        const basePoints = card.rewards.pointsPerRupee || 1;
        benefit = amount * basePoints * applicableOffer.rewardPointsMultiplier;

        // Apply max benefit cap
        if (applicableOffer.maxBenefit && benefit > applicableOffer.maxBenefit) {
          benefit = applicableOffer.maxBenefit;
        }

        benefitType = 'points';
        offerDescription = applicableOffer.description;
      }
    } else {
      // No specific offer, use general reward rate
      if (card.rewards.type === 'Cashback') {
        const categoryRate = card.rewards.categories[category] || card.rewards.categories['Others'] || 1;
        benefit = (amount * categoryRate) / 100;
        benefitType = 'cashback';
        offerDescription = `${categoryRate}% cashback`;
      } else if (card.rewards.type === 'Reward Points' || card.rewards.type === 'Airline Miles') {
        const categoryMultiplier = card.rewards.categories[category] || card.rewards.categories['Others'] || 2;
        benefit = amount * categoryMultiplier;
        benefitType = 'points';
        offerDescription = `${categoryMultiplier}X reward points`;
      }
    }

    // Calculate score (benefit as percentage of amount)
    const score = (benefit / amount) * 100;

    // Check credit availability
    const hasCredit = card.availableCredit >= amount;

    return {
      benefit,
      benefitType,
      score,
      hasCredit,
      offerDescription,
      reason: !hasCredit ? 'Insufficient credit limit' : offerDescription
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setErrorMessage('Please enter a valid amount');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!formData.category) {
      setErrorMessage('Please select a category');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setErrorMessage('');

    // Calculate benefits for each card
    const cardRecommendations = cards.map(card => {
      const calculation = calculateBenefit(card, amount, formData.category);
      return {
        ...card,
        ...calculation
      };
    });

    // Sort by benefit (descending)
    const sorted = cardRecommendations.sort((a, b) => b.benefit - a.benefit);

    setRecommendations(sorted);
    setShowResults(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatBenefit = (amount, type) => {
    if (type === 'cashback') {
      return `₹${amount.toFixed(0)}`;
    } else if (type === 'points') {
      return `${amount.toFixed(0)} points`;
    }
    return '-';
  };

  return (
    <div className="card-recommendation">
      <div className="recommendation-header">
        <h1>🎯 Which Card Should I Use?</h1>
        <p>Get personalized recommendations based on your purchase</p>
      </div>

      {errorMessage && (
        <div className="error-dialog">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="recommendation-form-container">
        <form onSubmit={handleSubmit} className="recommendation-form">
          <div className="form-group">
            <label>Purchase Amount</label>
            <div className="input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                step="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Merchant (Optional)</label>
            <input
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              placeholder="e.g., Amazon, Zomato, Uber"
            />
          </div>

          <button type="submit" className="btn-recommend">
            Get Recommendations
          </button>
        </form>
      </div>

      {showResults && recommendations.length > 0 && (
        <div className="recommendations-results">
          <h2>Recommended Cards for ₹{parseFloat(formData.amount).toLocaleString()} in {formData.category}</h2>

          <div className="recommendations-list">
            {recommendations.map((card, index) => (
              <div
                key={card.id}
                className={`recommendation-card ${index === 0 ? 'best-choice' : ''}`}
              >
                {index === 0 && <div className="best-badge">🏆 Best Choice</div>}

                <div className="card-header-section">
                  <div
                    className="card-color-indicator"
                    style={{ background: card.color }}
                  />
                  <div className="card-info">
                    <h3>{card.cardName}</h3>
                    <p>{card.bankName}</p>
                  </div>
                </div>

                <div className="benefit-display">
                  <div className="benefit-amount">
                    <span className="label">You'll Earn</span>
                    <h2>{formatBenefit(card.benefit, card.benefitType)}</h2>
                    <p className="benefit-percentage">
                      {card.score.toFixed(2)}% benefit
                    </p>
                  </div>
                </div>

                <div className="offer-details">
                  <p className="offer-text">
                    {card.offerDescription || 'Standard rewards'}
                  </p>
                  {!card.hasCredit && (
                    <p className="warning-text">⚠️ Insufficient credit limit</p>
                  )}
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-label">Available Credit</span>
                    <span className="stat-value">₹{card.availableCredit.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Credit Limit</span>
                    <span className="stat-value">₹{card.creditLimit.toLocaleString()}</span>
                  </div>
                </div>

                {card.offers && card.offers.length > 0 && (
                  <div className="active-offers">
                    <h4>Active Offers:</h4>
                    {card.offers.filter(offer => offer.category === formData.category).map(offer => (
                      <div key={offer.id} className="offer-item">
                        <span className="offer-icon">🎁</span>
                        <div>
                          <p className="offer-desc">{offer.description}</p>
                          <p className="offer-terms">{offer.terms}</p>
                          <p className="offer-validity">Valid till {offer.validTill}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && recommendations.length === 0 && (
        <div className="no-results">
          <p>No cards available for this purchase</p>
        </div>
      )}

      <RecommendationComments
        category={formData.category}
        amount={parseFloat(formData.amount) || 0}
      />
    </div>
  );
};

export default CardRecommendation;
