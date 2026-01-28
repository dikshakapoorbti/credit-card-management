import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { uploadExpensePDF } from '../config/firebase';
import './Modal.css';

const StatementUploadModal = ({ onClose }) => {
  const { cards, addExpense, user } = useApp();
  const [statementFile, setStatementFile] = useState(null);
  const [selectedCard, setSelectedCard] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [extractedExpenses, setExtractedExpenses] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please upload a PDF file only');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('PDF file size should not exceed 10MB');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      setStatementFile(file);
      setErrorMessage('');
    }
  };

  const removeFile = () => {
    setStatementFile(null);
    setExtractedExpenses([]);
    setShowPreview(false);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const parseStatement = async () => {
    if (!statementFile || !selectedCard) {
      setErrorMessage('Please select a card and upload a statement');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      setParsing(true);
      setUploading(true);

      // Upload PDF to Firebase Storage
      const statementId = `statement_${Date.now()}`;
      const pdfUrl = await uploadExpensePDF(user.uid, statementId, statementFile);

      // In a real implementation, you would:
      // 1. Send the PDF to a backend service for parsing
      // 2. Use OCR/PDF parsing libraries to extract transaction data
      // 3. Apply ML to categorize expenses

      // For now, we'll simulate extracted expenses
      // This is a placeholder - in production, replace with actual PDF parsing
      const mockExpenses = simulateStatementParsing();

      setExtractedExpenses(mockExpenses);
      setShowPreview(true);
      setErrorMessage('');
    } catch (error) {
      console.error('Error parsing statement:', error);
      setErrorMessage('Failed to parse statement. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setParsing(false);
      setUploading(false);
    }
  };

  const simulateStatementParsing = () => {
    // This simulates expense extraction from a credit card statement
    // In production, replace this with actual PDF parsing logic
    return [
      {
        id: `exp_${Date.now()}_1`,
        merchant: 'Amazon',
        amount: 2499,
        category: 'Shopping',
        description: 'Online purchase',
        date: new Date().toISOString().split('T')[0],
        selected: true
      },
      {
        id: `exp_${Date.now()}_2`,
        merchant: 'Swiggy',
        amount: 450,
        category: 'Food & Dining',
        description: 'Food delivery',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        selected: true
      },
      {
        id: `exp_${Date.now()}_3`,
        merchant: 'Shell Petrol Pump',
        amount: 2000,
        category: 'Fuel',
        description: 'Fuel purchase',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        selected: true
      }
    ];
  };

  const toggleExpenseSelection = (expenseId) => {
    setExtractedExpenses(prev =>
      prev.map(exp =>
        exp.id === expenseId ? { ...exp, selected: !exp.selected } : exp
      )
    );
  };

  const importSelectedExpenses = () => {
    const card = cards.find(c => c.id === selectedCard);
    if (!card) return;

    const selectedExpensesToImport = extractedExpenses.filter(exp => exp.selected);

    selectedExpensesToImport.forEach(expense => {
      const rewardRate = getRewardRate(card, expense.category);
      const rewardsEarned = expense.amount * rewardRate;

      addExpense({
        merchant: expense.merchant,
        amount: expense.amount,
        category: expense.category,
        description: expense.description || 'Imported from statement',
        cardId: selectedCard,
        date: expense.date,
        rewardsEarned,
        importedFromStatement: true
      });
    });

    onClose();
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Import from Credit Card Statement</h2>
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

        {!showPreview ? (
          <div className="statement-upload-form">
            <div className="form-group">
              <label>Select Credit Card *</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                required
              >
                <option value="">Choose the card for this statement</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.cardName} ({card.bankName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Upload Credit Card Statement *</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="statement-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="statement-upload" className="file-upload-button">
                  📎 Choose PDF Statement
                </label>
                {statementFile && (
                  <div className="file-selected">
                    <span className="file-name">📄 {statementFile.name}</span>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={removeFile}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <p className="file-upload-hint">Upload your credit card statement (PDF only, max 10MB)</p>
              </div>
            </div>

            <div className="info-box">
              <h4>ℹ️ How it works:</h4>
              <ul>
                <li>Upload your credit card statement in PDF format</li>
                <li>We'll automatically extract all transactions</li>
                <li>Review and select which expenses to import</li>
                <li>Rewards will be calculated automatically</li>
              </ul>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={parseStatement}
                disabled={!statementFile || !selectedCard || parsing}
              >
                {parsing ? 'Processing...' : 'Parse Statement'}
              </button>
            </div>
          </div>
        ) : (
          <div className="statement-preview">
            <div className="preview-header">
              <h3>Found {extractedExpenses.length} transactions</h3>
              <p>Review and select expenses to import</p>
            </div>

            <div className="extracted-expenses-list">
              {extractedExpenses.map(expense => (
                <div key={expense.id} className="extracted-expense-item">
                  <input
                    type="checkbox"
                    checked={expense.selected}
                    onChange={() => toggleExpenseSelection(expense.id)}
                    className="expense-checkbox"
                  />
                  <div className="extracted-expense-details">
                    <h4>{expense.merchant}</h4>
                    <div className="expense-meta-info">
                      <span className="expense-cat">{expense.category}</span>
                      <span className="expense-dt">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="extracted-expense-amount">
                    ₹{expense.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowPreview(false)}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={importSelectedExpenses}
                disabled={!extractedExpenses.some(exp => exp.selected)}
              >
                Import {extractedExpenses.filter(exp => exp.selected).length} Expenses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatementUploadModal;
