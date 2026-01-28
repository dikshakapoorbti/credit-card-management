import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { expenseCategories } from '../data/demoData';
import ConfirmDialog from '../components/ConfirmDialog';
import './CardManagement.css';

function CardManagement() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const [formData, setFormData] = useState({
    cardName: '',
    bankName: '',
    cardType: 'Credit',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    benefits: [''],
    rewardsType: 'Reward Points',
    basePointsPerRupee: 1,
    offers: []
  });

  const [offerForm, setOfferForm] = useState({
    category: '',
    cashbackPercent: 0,
    rewardPointsMultiplier: 0,
    maxBenefit: '',
    minTransaction: 0,
    description: '',
    validTill: '',
    terms: ''
  });

  const cardColorOptions = [
    { name: 'Purple Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Pink Gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Orange Gradient', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { name: 'Blue Gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Green Gradient', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { name: 'Gold Gradient', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }
  ];

  useEffect(() => {
    // Check admin authentication
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadCards();
  }, [navigate]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const cardsSnapshot = await getDocs(collection(db, 'creditCards'));
      const cardsData = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCards(cardsData);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleOfferInputChange = (e) => {
    const { name, value } = e.target;
    setOfferForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addOffer = () => {
    if (!offerForm.category) {
      return;
    }

    const newOffer = {
      id: `offer${Date.now()}`,
      category: offerForm.category,
      cashbackPercent: parseFloat(offerForm.cashbackPercent) || 0,
      rewardPointsMultiplier: parseFloat(offerForm.rewardPointsMultiplier) || 0,
      maxBenefit: offerForm.maxBenefit ? parseFloat(offerForm.maxBenefit) : null,
      minTransaction: parseFloat(offerForm.minTransaction) || 0,
      description: offerForm.description,
      validTill: offerForm.validTill,
      terms: offerForm.terms
    };

    setFormData(prev => ({
      ...prev,
      offers: [...prev.offers, newOffer]
    }));

    // Reset offer form
    setOfferForm({
      category: '',
      cashbackPercent: 0,
      rewardPointsMultiplier: 0,
      maxBenefit: '',
      minTransaction: 0,
      description: '',
      validTill: '',
      terms: ''
    });
  };

  const removeOffer = (index) => {
    setFormData(prev => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cardData = {
        ...formData,
        benefits: formData.benefits.filter(b => b.trim() !== ''),
        rewards: {
          type: formData.rewardsType,
          pointsPerRupee: parseFloat(formData.basePointsPerRupee) || 1,
          categories: formData.offers.reduce((acc, offer) => {
            acc[offer.category] = offer.rewardPointsMultiplier || offer.cashbackPercent;
            return acc;
          }, {})
        },
        createdAt: new Date().toISOString(),
        isActive: true
      };

      if (editingCard) {
        // Update existing card
        await updateDoc(doc(db, 'creditCards', editingCard.id), cardData);
      } else {
        // Add new card
        await addDoc(collection(db, 'creditCards'), cardData);
      }

      // Reset form
      resetForm();
      loadCards();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      cardName: card.cardName || '',
      bankName: card.bankName || '',
      cardType: card.cardType || 'Credit',
      color: card.color || cardColorOptions[0].value,
      benefits: card.benefits || [''],
      rewardsType: card.rewards?.type || 'Reward Points',
      basePointsPerRupee: card.rewards?.pointsPerRupee || 1,
      offers: card.offers || []
    });
    setShowForm(true);
  };

  const handleDelete = (card) => {
    setCardToDelete(card);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      await deleteDoc(doc(db, 'creditCards', cardToDelete.id));
      setShowDeleteDialog(false);
      setCardToDelete(null);
      loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      cardName: '',
      bankName: '',
      cardType: 'Credit',
      color: cardColorOptions[0].value,
      benefits: [''],
      rewardsType: 'Reward Points',
      basePointsPerRupee: 1,
      offers: []
    });
    setOfferForm({
      category: '',
      cashbackPercent: 0,
      rewardPointsMultiplier: 0,
      maxBenefit: '',
      minTransaction: 0,
      description: '',
      validTill: '',
      terms: ''
    });
    setEditingCard(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading cards...</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Card"
        message={`Are you sure you want to delete "${cardToDelete?.cardName}"? This action cannot be undone and will remove the card from the system.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setCardToDelete(null);
        }}
      />

      <div className="card-management">
      <div className="card-management-header">
        <div>
          <h1>Manage Credit Cards</h1>
          <p>Add, edit, or remove credit cards from the system</p>
        </div>
        <button
          className="add-card-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '➕ Add New Card'}
        </button>
      </div>

      {showForm && (
        <div className="card-form-container">
          <h2>{editingCard ? 'Edit Card' : 'Add New Card'}</h2>

          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Card Name *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="e.g., HDFC Regalia"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g., HDFC Bank"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Card Type *</label>
                  <select
                    name="cardType"
                    value={formData.cardType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Credit">Credit Card</option>
                    <option value="Debit">Debit Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Card Color Theme *</label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    required
                  >
                    {cardColorOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="color-preview" style={{ background: formData.color }}>
                <p>Card Preview</p>
              </div>
            </div>

            <div className="form-section">
              <h3>Rewards Settings</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Rewards Type *</label>
                  <select
                    name="rewardsType"
                    value={formData.rewardsType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Reward Points">Reward Points</option>
                    <option value="Cashback">Cashback</option>
                    <option value="Airline Miles">Airline Miles</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Base Points per ₹100 *</label>
                  <input
                    type="number"
                    name="basePointsPerRupee"
                    value={formData.basePointsPerRupee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Card Benefits</h3>

              {formData.benefits.map((benefit, index) => (
                <div key={index} className="benefit-row">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder="e.g., Airport lounge access"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeBenefit(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="add-benefit-button"
                onClick={addBenefit}
              >
                + Add Benefit
              </button>
            </div>

            <div className="form-section">
              <h3>Offers & Cashback</h3>

              <div className="offer-form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={offerForm.category}
                    onChange={handleOfferInputChange}
                  >
                    <option value="">Select category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cashback %</label>
                  <input
                    type="number"
                    name="cashbackPercent"
                    value={offerForm.cashbackPercent}
                    onChange={handleOfferInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Reward Points Multiplier</label>
                  <input
                    type="number"
                    name="rewardPointsMultiplier"
                    value={offerForm.rewardPointsMultiplier}
                    onChange={handleOfferInputChange}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Max Benefit (₹)</label>
                  <input
                    type="number"
                    name="maxBenefit"
                    value={offerForm.maxBenefit}
                    onChange={handleOfferInputChange}
                    min="0"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="form-group">
                  <label>Min Transaction (₹)</label>
                  <input
                    type="number"
                    name="minTransaction"
                    value={offerForm.minTransaction}
                    onChange={handleOfferInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Valid Till</label>
                  <input
                    type="date"
                    name="validTill"
                    value={offerForm.validTill}
                    onChange={handleOfferInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={offerForm.description}
                    onChange={handleOfferInputChange}
                    placeholder="e.g., 5% cashback on dining"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Terms & Conditions</label>
                  <textarea
                    name="terms"
                    value={offerForm.terms}
                    onChange={handleOfferInputChange}
                    placeholder="e.g., Valid on select partner restaurants"
                    rows="2"
                  />
                </div>
              </div>

              <button
                type="button"
                className="add-offer-button"
                onClick={addOffer}
              >
                + Add Offer
              </button>

              {formData.offers.length > 0 && (
                <div className="offers-list">
                  <h4>Added Offers ({formData.offers.length})</h4>
                  {formData.offers.map((offer, index) => (
                    <div key={index} className="offer-item">
                      <div className="offer-info">
                        <strong>{offer.category}</strong>
                        <p>{offer.description}</p>
                        <div className="offer-details">
                          {offer.cashbackPercent > 0 && (
                            <span className="badge">{offer.cashbackPercent}% Cashback</span>
                          )}
                          {offer.rewardPointsMultiplier > 0 && (
                            <span className="badge">{offer.rewardPointsMultiplier}X Points</span>
                          )}
                          {offer.maxBenefit && (
                            <span className="badge">Max: ₹{offer.maxBenefit}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="remove-offer-button"
                        onClick={() => removeOffer(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="submit-button">
                {editingCard ? 'Update Card' : 'Add Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cards-list">
        <h2>All Cards ({cards.length})</h2>

        {cards.length === 0 ? (
          <div className="empty-state">
            <p>No cards added yet. Click "Add New Card" to get started.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {cards.map(card => (
              <div key={card.id} className="admin-card-item">
                <div className="card-preview" style={{ background: card.color }}>
                  <h3>{card.cardName}</h3>
                  <p>{card.bankName}</p>
                </div>
                <div className="card-details">
                  <div className="card-meta">
                    <span className="card-type-badge">{card.cardType}</span>
                    <span className="rewards-badge">{card.rewards?.type}</span>
                  </div>
                  <p className="offers-count">{card.offers?.length || 0} Offers</p>
                  <div className="card-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(card)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(card)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default CardManagement;
