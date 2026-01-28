import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import AddExpenseModal from './AddExpenseModal';
import StatementUploadModal from './StatementUploadModal';
import ConfirmDialog from './ConfirmDialog';
import { expenseCategories } from '../data/demoData';
import './Expenses.css';

const Expenses = () => {
  const { expenses, cards, deleteExpense } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCard, setSelectedCard] = useState('All');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const filteredExpenses = expenses.filter(expense => {
    const categoryMatch = selectedCategory === 'All' || expense.category === selectedCategory;
    const cardMatch = selectedCard === 'All' || expense.cardId === selectedCard;
    return categoryMatch && cardMatch;
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalRewards = filteredExpenses.reduce((sum, exp) => sum + (exp.rewardsEarned || 0), 0);

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p className="subtitle">Track and analyze your spending</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowStatementModal(true)}>
            📄 Import from Statement
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Expense
          </button>
        </div>
      </div>

      <div className="expense-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">Total Spent</span>
            <h3>₹{totalAmount.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Transactions</span>
            <h3>{filteredExpenses.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎁</div>
          <div className="stat-content">
            <span className="stat-label">Rewards Earned</span>
            <h3>{card => card.rewards.type === 'Cashback' ? '₹' : ''}{Math.round(totalRewards * 0.25)}</h3>
          </div>
        </div>
      </div>

      <div className="expense-filters">
        <div className="filter-group">
          <label>Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Card</label>
          <select value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)}>
            <option value="All">All Cards</option>
            {cards.map(card => (
              <option key={card.id} value={card.id}>{card.cardName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="expenses-list">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => {
            const card = cards.find(c => c.id === expense.cardId);
            return (
              <div key={expense.id} className="expense-item">
                <div className="expense-icon">{getCategoryIcon(expense.category)}</div>
                <div className="expense-details">
                  <h4>{expense.merchant}</h4>
                  <div className="expense-meta">
                    <span className="expense-category">{expense.category}</span>
                    <span className="expense-card">{card?.cardName}</span>
                  </div>
                  {expense.description && (
                    <p className="expense-description">{expense.description}</p>
                  )}
                </div>
                <div className="expense-right">
                  <div className="expense-amount">₹{expense.amount.toLocaleString()}</div>
                  <div className="expense-date">{formatDate(expense.date)}</div>
                  {expense.rewardsEarned > 0 && (
                    <div className="expense-rewards">
                      +{card?.rewards.type === 'Cashback' ? '₹' : ''}{Math.round(expense.rewardsEarned * 0.25)} rewards
                    </div>
                  )}
                  <button
                    className="btn-delete-small"
                    onClick={() => {
                      setExpenseToDelete(expense);
                      setShowDeleteDialog(true);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No expenses found</h3>
            <p>Add your first expense to start tracking</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddExpenseModal onClose={() => setShowAddModal(false)} />
      )}

      {showStatementModal && (
        <StatementUploadModal onClose={() => setShowStatementModal(false)} />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Expense"
        message={`Are you sure you want to delete the expense at ${expenseToDelete?.merchant} for ₹${expenseToDelete?.amount}?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete.id);
            setShowDeleteDialog(false);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => {
          setShowDeleteDialog(false);
          setExpenseToDelete(null);
        }}
      />
    </div>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    'Dining': '🍽️',
    'Travel': '✈️',
    'Shopping': '🛍️',
    'Online Shopping': '🛒',
    'Groceries': '🥬',
    'Utilities': '💡',
    'Fuel': '⛽',
    'Entertainment': '🎬',
    'Healthcare': '🏥',
    'Education': '📚',
    'Bill Payments': '💳',
    'Amazon': '📦',
    'Others': '📌'
  };
  return icons[category] || '💰';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default Expenses;
