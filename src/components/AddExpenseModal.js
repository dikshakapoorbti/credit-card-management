import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getBestCardRecommendation } from '../utils/recommendationEngine';
import { expenseCategories } from '../data/demoData';
import './Modal.css';

const AddExpenseModal = ({ onClose }) => {
  const { cards, addExpense } = useApp();
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: 'Shopping',
    description: '',
    cardId: ''
  });
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Only show recommendations if amount and category are filled
    // But don't force users to use them
    if (formData.amount && formData.category && parseFloat(formData.amount) > 0) {
      const recs = getBestCardRecommendation(cards, formData.category, parseFloat(formData.amount));
      setRecommendations(recs || []);
    } else {
      setRecommendations([]);
    }
  }, [formData.amount, formData.category, cards]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCard = cards.find(c => c.id === formData.cardId);
    if (!selectedCard) {
      setErrorMessage('Please select a card');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const rewardRate = getRewardRate(selectedCard, formData.category);
    const rewardsEarned = parseFloat(formData.amount) * rewardRate;

    const expense = {
      ...formData,
      amount: parseFloat(formData.amount),
      rewardsEarned
    };

    addExpense(expense);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const selectRecommendedCard = (cardId) => {
    setFormData({ ...formData, cardId });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Expense</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {errorMessage && (
          <div className="error-dialog">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label>Merchant / Store Name</label>
            <input
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              placeholder="e.g., Starbucks, Amazon"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add notes about this expense"
            />
          </div>

          <div className="form-group">
            <label>Card Used for Payment *</label>
            <select
              name="cardId"
              value={formData.cardId}
              onChange={handleChange}
              required
            >
              <option value="">Select a card</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.cardName} ({card.bankName}) - Available: ₹{card.availableCredit.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <div className="recommendations-header">
                <div>
                  <h3>💡 Smart Card Recommendations</h3>
                  <p className="recommendations-subtitle">
                    Based on your amount and category, here are the best cards for maximum rewards
                  </p>
                </div>
                <button
                  type="button"
                  className="toggle-recommendations"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                >
                  {showRecommendations ? 'Hide' : 'Show'} Suggestions
                </button>
              </div>

              {showRecommendations && (

              <div className="recommendations-list">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div
                    key={rec.card.id}
                    className={`recommendation-card ${formData.cardId === rec.card.id ? 'selected' : ''}`}
                    onClick={() => selectRecommendedCard(rec.card.id)}
                  >
                    {index === 0 && (
                      <div className="best-badge">Best Choice</div>
                    )}

                    <div className="rec-header">
                      <div className="rec-rank">#{index + 1}</div>
                      <div className="rec-card-info">
                        <h4>{rec.card.cardName}</h4>
                        <p>{rec.card.bankName}</p>
                      </div>
                      <div className="rec-score">
                        <div className="score-value">{rec.score.toFixed(0)}</div>
                        <div className="score-label">Score</div>
                      </div>
                    </div>

                    <div className="rec-details">
                      <div className="rec-reward">
                        <span className="rec-label">Estimated Rewards:</span>
                        <span className="rec-value reward-highlight">
                          ₹{Math.round(rec.rewardValue)}
                        </span>
                      </div>
                      <div className="rec-reward">
                        <span className="rec-label">Reward Rate:</span>
                        <span className="rec-value">
                          {rec.card.rewards.type === 'Cashback'
                            ? `${rec.rewardRate}%`
                            : `${rec.rewardRate}x points`}
                        </span>
                      </div>
                      <div className="rec-reward">
                        <span className="rec-label">Utilization After:</span>
                        <span className="rec-value">{rec.utilizationAfter.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="rec-reason">{rec.reason}</div>

                    <div className="rec-footer">
                      <span className="available-credit">
                        Available: ₹{rec.card.availableCredit.toLocaleString()}
                      </span>
                      {formData.cardId === rec.card.id && (
                        <span className="selected-indicator">✓ Selected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!formData.cardId}>
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getRewardRate = (card, category) => {
  if (!card.rewards || !card.rewards.categories) {
    return card.rewards?.pointsPerRupee || 0;
  }

  if (card.rewards.categories[category]) {
    return card.rewards.categories[category];
  }

  const categoryLower = category.toLowerCase();
  for (const [cat, rate] of Object.entries(card.rewards.categories)) {
    if (cat.toLowerCase().includes(categoryLower) || categoryLower.includes(cat.toLowerCase())) {
      return rate;
    }
  }

  return card.rewards.categories['Others'] || card.rewards.pointsPerRupee || 0;
};

export default AddExpenseModal;
