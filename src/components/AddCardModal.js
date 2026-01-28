import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import './Modal.css';

const AddCardModal = ({ onClose }) => {
  const { addCard } = useApp();
  const [formData, setFormData] = useState({
    cardName: '',
    bankName: '',
    cardNumber: '',
    expiryDate: '',
    creditLimit: '',
    dueDate: '',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    rewardType: 'Reward Points'
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const lastFour = formData.cardNumber.slice(-4);
    const maskedNumber = `${formData.cardNumber.slice(0, 4)}********${lastFour}`;

    const newCard = {
      cardName: formData.cardName,
      bankName: formData.bankName,
      cardNumber: maskedNumber,
      lastFourDigits: lastFour,
      cardType: 'Credit',
      expiryDate: formData.expiryDate,
      creditLimit: parseInt(formData.creditLimit),
      availableCredit: parseInt(formData.creditLimit),
      currentBalance: 0,
      dueDate: formData.dueDate,
      minimumDue: 0,
      color: formData.color,
      rewards: {
        type: formData.rewardType,
        pointsBalance: 0,
        cashbackBalance: 0,
        pointsPerRupee: formData.rewardType === 'Reward Points' ? 2 : 0,
        cashbackPercentage: formData.rewardType === 'Cashback' ? 1 : 0,
        categories: {
          'Shopping': 2,
          'Dining': 2,
          'Others': 1
        }
      },
      benefits: [
        'Standard benefits apply',
        'Contact your bank for details'
      ]
    };

    addCard(newCard);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const cardColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fe8c00 0%, #f83600 100%)'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Credit Card</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label>Card Name</label>
            <input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              placeholder="e.g., HDFC Regalia"
              required
            />
          </div>

          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="e.g., HDFC Bank"
              required
            />
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="16 digit card number"
              maxLength="16"
              pattern="[0-9]{16}"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YYYY"
                pattern="(0[1-9]|1[0-2])\/20[2-9][0-9]"
                required
              />
            </div>

            <div className="form-group">
              <label>Credit Limit</label>
              <input
                type="number"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleChange}
                placeholder="e.g., 200000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Reward Type</label>
            <select
              name="rewardType"
              value={formData.rewardType}
              onChange={handleChange}
            >
              <option value="Reward Points">Reward Points</option>
              <option value="Cashback">Cashback</option>
              <option value="Airline Miles">Airline Miles</option>
            </select>
          </div>

          <div className="form-group">
            <label>Card Color</label>
            <div className="color-picker">
              {cardColors.map((color, index) => (
                <div
                  key={index}
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;
