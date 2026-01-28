import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import CardReviews from './CardReviews';
import './Reviews.css';

const Reviews = () => {
  const { cards } = useApp();
  const [selectedCard, setSelectedCard] = useState(cards[0] || null);

  if (cards.length === 0) {
    return (
      <div className="reviews-page">
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h3>No cards available</h3>
          <p>Add cards first to write reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="page-header">
        <div>
          <h1>Card Reviews</h1>
          <p className="subtitle">Share your experience and read reviews from other users</p>
        </div>
      </div>

      <div className="card-selector-section">
        <label className="selector-label">Select a card to review:</label>
        <div className="card-selector-grid">
          {cards.map(card => (
            <div
              key={card.id}
              className={`card-selector-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
              onClick={() => setSelectedCard(card)}
            >
              <div className="card-color-indicator" style={{ background: card.color }} />
              <div className="card-selector-info">
                <h4>{card.cardName}</h4>
                <p>{card.bankName}</p>
              </div>
              {selectedCard?.id === card.id && (
                <div className="selected-badge">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedCard && (
        <div className="selected-card-details">
          <div className="card-header-section">
            <div
              className="card-color-indicator-large"
              style={{ background: selectedCard.color }}
            />
            <div className="card-info-large">
              <h2>{selectedCard.cardName}</h2>
              <p className="bank-name">{selectedCard.bankName}</p>
              <div className="card-meta">
                <span className="meta-item">
                  <span className="meta-label">Type:</span>
                  <span className="meta-value">{selectedCard.rewards.type}</span>
                </span>
                <span className="meta-item">
                  <span className="meta-label">Credit Limit:</span>
                  <span className="meta-value">₹{selectedCard.creditLimit.toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>

          <CardReviews card={selectedCard} />
        </div>
      )}
    </div>
  );
};

export default Reviews;
