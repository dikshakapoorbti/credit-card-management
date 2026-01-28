import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  analyzeSpendingPattern,
  getCreditUtilizationInsights,
  getUpcomingDues
} from '../utils/recommendationEngine';
import { demoCards, demoExpenses } from '../data/demoData';
import FirstTimeUserGuide from './FirstTimeUserGuide';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { cards, expenses, user, setCards, setExpenses } = useApp();
  const [showGuide, setShowGuide] = useState(() => {
    // Show guide if user hasn't seen it and has no cards
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    return !hasSeenGuide && cards.length === 0;
  });

  const spendingAnalysis = analyzeSpendingPattern(expenses, cards);
  const utilizationInsights = getCreditUtilizationInsights(cards);
  const upcomingDues = getUpcomingDues(cards);

  const totalRewards = cards.reduce((sum, card) => {
    if (card.rewards.type === 'Cashback') {
      return sum + (card.rewards.cashbackBalance || 0);
    } else {
      return sum + ((card.rewards.pointsBalance || 0) * 0.25); // Convert points to rupees
    }
  }, 0);

  const handleLoadDemoData = () => {
    setCards(demoCards);
    setExpenses(demoExpenses);
    localStorage.setItem('cards', JSON.stringify(demoCards));
    localStorage.setItem('expenses', JSON.stringify(demoExpenses));
    localStorage.setItem('hasSeenGuide', 'true');
    setShowGuide(false);
  };

  const handleAddCard = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setShowGuide(false);
    navigate('/cards');
  };

  // Show empty state for first-time users with no cards
  if (cards.length === 0) {
    return (
      <div className="dashboard">
        {showGuide && <FirstTimeUserGuide onComplete={() => setShowGuide(false)} />}

        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <h2>Welcome to CardManager!</h2>
          <p>
            You don't have any credit cards added yet. Get started by adding your first card
            or explore with demo data to see how CardManager helps you maximize rewards!
          </p>

          <div className="empty-state-actions">
            <button className="btn-add-card" onClick={handleAddCard}>
              <span>➕</span> Add Your First Card
            </button>
            <button className="btn-load-demo" onClick={handleLoadDemoData}>
              <span>🎮</span> Try Demo Data
            </button>
          </div>

          <div className="features-preview">
            <h3>What you can do with CardManager:</h3>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div>
                  <h4>Smart Recommendations</h4>
                  <p>Get AI-powered suggestions on which card to use for maximum rewards</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div>
                  <h4>Expense Tracking</h4>
                  <p>Track all your spending and see detailed analytics by category</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <div>
                  <h4>Rewards Maximization</h4>
                  <p>Never miss out on cashback, points, or rewards again</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <h4>Payment Reminders</h4>
                  <p>Stay on top of due dates and avoid late payment fees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {showGuide && <FirstTimeUserGuide onComplete={() => setShowGuide(false)} />}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="subtitle">Here's your financial overview</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#3b82f6' }}>💳</div>
          <div className="summary-content">
            <p className="summary-label">Total Cards</p>
            <h2 className="summary-value">{cards.length}</h2>
            <p className="summary-detail">Active cards</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#10b981' }}>💰</div>
          <div className="summary-content">
            <p className="summary-label">Total Credit Limit</p>
            <h2 className="summary-value">₹{(utilizationInsights.totalLimit / 1000).toFixed(0)}K</h2>
            <p className="summary-detail">Across all cards</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#f59e0b' }}>📊</div>
          <div className="summary-content">
            <p className="summary-label">Outstanding</p>
            <h2 className="summary-value">₹{(utilizationInsights.totalUsed / 1000).toFixed(0)}K</h2>
            <p className="summary-detail">{utilizationInsights.utilizationPercentage.toFixed(1)}% utilization</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#8b5cf6' }}>🎁</div>
          <div className="summary-content">
            <p className="summary-label">Total Rewards</p>
            <h2 className="summary-value">₹{Math.round(totalRewards)}</h2>
            <p className="summary-detail">Available to redeem</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Credit Utilization */}
        <div className="dashboard-card">
          <h3>Credit Utilization</h3>
          <div className="utilization-container">
            <div className="utilization-chart">
              <svg viewBox="0 0 200 200" className="circular-chart">
                <circle
                  className="circle-bg"
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                <circle
                  className="circle-progress"
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={utilizationInsights.color}
                  strokeWidth="20"
                  strokeDasharray={`${utilizationInsights.utilizationPercentage * 5.03} 503`}
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="95" textAnchor="middle" className="percentage-text">
                  {utilizationInsights.utilizationPercentage.toFixed(1)}%
                </text>
                <text x="100" y="115" textAnchor="middle" className="status-text">
                  {utilizationInsights.status}
                </text>
              </svg>
            </div>
            <div className="utilization-details">
              <div className="utilization-row">
                <span>Total Limit:</span>
                <strong>₹{utilizationInsights.totalLimit.toLocaleString()}</strong>
              </div>
              <div className="utilization-row">
                <span>Used:</span>
                <strong>₹{utilizationInsights.totalUsed.toLocaleString()}</strong>
              </div>
              <div className="utilization-row">
                <span>Available:</span>
                <strong>₹{(utilizationInsights.totalLimit - utilizationInsights.totalUsed).toLocaleString()}</strong>
              </div>
              <p className="utilization-tip">{utilizationInsights.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="dashboard-card">
          <h3>Top Spending Categories</h3>
          <div className="category-list">
            {spendingAnalysis.topCategories.map((cat, index) => (
              <div key={cat.category} className="category-item">
                <div className="category-info">
                  <span className="category-rank">#{index + 1}</span>
                  <span className="category-name">{cat.category}</span>
                </div>
                <div className="category-amount">
                  <span>₹{cat.amount.toLocaleString()}</span>
                  <span className="category-percentage">{cat.percentage.toFixed(1)}%</span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="total-spending">
            <span>Total Spending</span>
            <strong>₹{spendingAnalysis.totalSpending.toLocaleString()}</strong>
          </div>
        </div>

        {/* Upcoming Dues */}
        <div className="dashboard-card upcoming-dues">
          <h3>Upcoming Payment Dues</h3>
          {upcomingDues.length > 0 ? (
            <div className="dues-list">
              {upcomingDues.map(card => (
                <div key={card.id} className="due-item">
                  <div className="due-card-info">
                    <h4>{card.cardName}</h4>
                    <p>{card.bankName}</p>
                  </div>
                  <div className="due-details">
                    <div className="due-amount">
                      <span className="label">Total Due</span>
                      <strong>₹{card.currentBalance.toLocaleString()}</strong>
                    </div>
                    <div className="due-date">
                      <span className="label">Due in</span>
                      <strong className={card.daysUntilDue <= 5 ? 'urgent' : ''}>
                        {card.daysUntilDue} days
                      </strong>
                    </div>
                  </div>
                  <div className="minimum-due">
                    Minimum: ₹{card.minimumDue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>🎉 No pending dues!</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-card">
          <h3>Recent Transactions</h3>
          <div className="transaction-list">
            {expenses.slice(0, 5).map(expense => {
              const card = cards.find(c => c.id === expense.cardId);
              return (
                <div key={expense.id} className="transaction-item">
                  <div className="transaction-icon">{getCategoryIcon(expense.category)}</div>
                  <div className="transaction-info">
                    <h4>{expense.merchant}</h4>
                    <p>{card?.cardName} • {expense.category}</p>
                  </div>
                  <div className="transaction-amount">
                    <strong>₹{expense.amount.toLocaleString()}</strong>
                    <p className="transaction-date">{formatDate(expense.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
  const today = new Date();
  const diffTime = today - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export default Dashboard;
