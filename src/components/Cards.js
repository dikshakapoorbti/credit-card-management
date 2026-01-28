import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import AddCardModal from './AddCardModal';
import ConfirmDialog from './ConfirmDialog';
import './Cards.css';

const Cards = () => {
  const { cards, deleteCard } = useApp();
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  return (
    <div className="cards-page">
      <div className="page-header">
        <div>
          <h1>My Credit Cards</h1>
          <p className="subtitle">Manage all your credit cards in one place</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Card
        </button>
      </div>

      <div className="cards-grid">
        {cards.map(card => (
          <div key={card.id} className="credit-card-container">
            <div
              className="credit-card"
              style={{ background: card.color }}
              onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
            >
              <div className="card-header">
                <div className="card-bank">{card.bankName}</div>
                <div className="card-type">💳</div>
              </div>

              <div className="card-chip">
                <div className="chip"></div>
              </div>

              <div className="card-number">{card.cardNumber}</div>

              <div className="card-footer">
                <div className="card-holder">
                  <div className="label">CARDHOLDER</div>
                  <div className="value">{card.cardName}</div>
                </div>
                <div className="card-expiry">
                  <div className="label">EXPIRES</div>
                  <div className="value">{card.expiryDate}</div>
                </div>
              </div>
            </div>

            {selectedCard?.id === card.id && (
              <div className="card-details">
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Credit Limit</span>
                    <span className="stat-value">₹{card.creditLimit.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Available</span>
                    <span className="stat-value available">₹{card.availableCredit.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Outstanding</span>
                    <span className="stat-value outstanding">₹{card.currentBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="card-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(card.currentBalance / card.creditLimit) * 100}%`,
                        background: (card.currentBalance / card.creditLimit) > 0.7 ? '#ef4444' : '#3b82f6'
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    {((card.currentBalance / card.creditLimit) * 100).toFixed(1)}% utilized
                  </div>
                </div>

                <div className="card-rewards">
                  <h4>Rewards</h4>
                  <div className="rewards-info">
                    <div className="reward-item">
                      <span>Type:</span>
                      <strong>{card.rewards.type}</strong>
                    </div>
                    <div className="reward-item">
                      <span>Balance:</span>
                      <strong>
                        {card.rewards.type === 'Cashback'
                          ? `₹${card.rewards.cashbackBalance}`
                          : `${card.rewards.pointsBalance} points`}
                      </strong>
                    </div>
                  </div>

                  <h5>Reward Categories</h5>
                  <div className="reward-categories">
                    {Object.entries(card.rewards.categories).map(([category, rate]) => (
                      <div key={category} className="reward-category">
                        <span>{category}</span>
                        <span className="reward-rate">
                          {card.rewards.type === 'Cashback' ? `${rate}%` : `${rate}x`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {card.offers && card.offers.length > 0 && (
                  <div className="card-offers">
                    <h4>Active Offers ({card.offers.length})</h4>
                    <div className="offers-list">
                      {card.offers.map((offer, index) => (
                        <div key={offer.id || index} className="offer-card">
                          <div className="offer-header">
                            <span className="offer-category">{offer.category}</span>
                            <span className="offer-badge">
                              {offer.cashbackPercent > 0
                                ? `${offer.cashbackPercent}% Cashback`
                                : `${offer.rewardPointsMultiplier}X Points`}
                            </span>
                          </div>
                          <p className="offer-description">{offer.description}</p>
                          <div className="offer-details">
                            {offer.minTransaction > 0 && (
                              <span className="offer-condition">Min: ₹{offer.minTransaction}</span>
                            )}
                            {offer.maxBenefit && (
                              <span className="offer-condition">Max: ₹{offer.maxBenefit}</span>
                            )}
                            {offer.validTill && (
                              <span className="offer-validity">
                                Valid till {new Date(offer.validTill).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                          {offer.terms && (
                            <p className="offer-terms">* {offer.terms}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card-benefits">
                  <h4>Benefits</h4>
                  <ul>
                    {card.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="card-payment-info">
                  <div className="payment-row">
                    <span>Due Date:</span>
                    <strong>{new Date(card.dueDate).toLocaleDateString('en-IN')}</strong>
                  </div>
                  <div className="payment-row">
                    <span>Minimum Due:</span>
                    <strong>₹{card.minimumDue.toLocaleString()}</strong>
                  </div>
                </div>

                <button
                  className="btn-delete"
                  onClick={() => {
                    setCardToDelete(card);
                    setShowDeleteDialog(true);
                  }}
                >
                  Delete Card
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h3>No cards added yet</h3>
          <p>Add your first credit card to get started</p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            Add Card
          </button>
        </div>
      )}

      {showAddModal && (
        <AddCardModal onClose={() => setShowAddModal(false)} />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Card"
        message={`Are you sure you want to delete ${cardToDelete?.cardName}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          if (cardToDelete) {
            deleteCard(cardToDelete.id);
            setSelectedCard(null);
            setShowDeleteDialog(false);
            setCardToDelete(null);
          }
        }}
        onCancel={() => {
          setShowDeleteDialog(false);
          setCardToDelete(null);
        }}
      />
    </div>
  );
};

export default Cards;
