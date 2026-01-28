import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CardManagement from './CardManagement';
import OfferManagement from './OfferManagement';
import UserManagement from './UserManagement';
import Analytics from './Analytics';
import ConfirmDialog from '../components/ConfirmDialog';
import logo from '../assets/credit-card-logo.png';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCards: 0,
    totalExpenses: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const adminUserData = localStorage.getItem('adminUser');

    if (!isAdminLoggedIn || !adminUserData) {
      navigate('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(adminUserData));
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Load cards count
      let totalCards = 0;
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.cards) {
          totalCards += userData.cards.length;
        }
      });

      // Load expenses count
      let totalExpenses = 0;
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.expenses) {
          totalExpenses += userData.expenses.length;
        }
      });

      setStats({
        totalUsers,
        totalCards,
        totalExpenses,
        totalReviews: 0 // Will be implemented later
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUser');
    setShowLogoutDialog(false);
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Admin Logout"
        message="Are you sure you want to logout from the admin panel?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img
            src={logo}
            alt="CardManager Admin"
            className="admin-sidebar-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="admin-sidebar-logo-text" style={{ display: 'none' }}>🔐 Admin</div>
          <h2>Admin Portal</h2>
        </div>

        <div className="admin-user-info">
          <div className="admin-avatar">
            {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h4>{adminUser?.name || 'Admin'}</h4>
            <p>{adminUser?.email}</p>
          </div>
        </div>

        <nav className="admin-nav">
          <div
            className="admin-nav-item"
            onClick={() => navigate('/admin/dashboard')}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard</span>
          </div>

          <div
            className="admin-nav-item"
            onClick={() => navigate('/admin/cards')}
          >
            <span className="admin-nav-icon">💳</span>
            <span>Manage Cards</span>
          </div>

          <div
            className="admin-nav-item"
            onClick={() => navigate('/admin/offers')}
          >
            <span className="admin-nav-icon">🎁</span>
            <span>Manage Offers</span>
          </div>

          <div
            className="admin-nav-item"
            onClick={() => navigate('/admin/users')}
          >
            <span className="admin-nav-icon">👥</span>
            <span>Users</span>
          </div>

          <div
            className="admin-nav-item"
            onClick={() => navigate('/admin/analytics')}
          >
            <span className="admin-nav-icon">📈</span>
            <span>Analytics</span>
          </div>

          <div className="admin-nav-item" onClick={handleLogout}>
            <span className="admin-nav-icon">🚪</span>
            <span>Logout</span>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="view-app-button"
            onClick={() => navigate('/dashboard')}
          >
            View User App →
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <Routes>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardContent stats={stats} adminUser={adminUser} navigate={navigate} />} />
          <Route path="cards" element={<CardManagement />} />
          <Route path="offers" element={<OfferManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
    </>
  );
}

function AdminDashboardContent({ stats, adminUser, navigate }) {
  return (
    <>
      <header className="admin-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {adminUser?.name || 'Admin'}! Here's what's happening today.</p>
      </header>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <span className="stat-label">Registered accounts</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon cards-icon">💳</div>
          <div className="stat-content">
            <h3>Credit Cards</h3>
            <p className="stat-number">{stats.totalCards}</p>
            <span className="stat-label">Cards in system</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon expenses-icon">💰</div>
          <div className="stat-content">
            <h3>Expenses Tracked</h3>
            <p className="stat-number">{stats.totalExpenses}</p>
            <span className="stat-label">Total transactions</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon reviews-icon">⭐</div>
          <div className="stat-content">
            <h3>Reviews</h3>
            <p className="stat-number">{stats.totalReviews}</p>
            <span className="stat-label">User reviews</span>
          </div>
        </div>
      </div>

      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button
            className="quick-action-card"
            onClick={() => navigate('/admin/cards')}
          >
            <span className="action-icon">➕</span>
            <h3>Add New Card</h3>
            <p>Add a new credit card to the system</p>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/admin/offers')}
          >
            <span className="action-icon">🎁</span>
            <h3>Create Offer</h3>
            <p>Add new cashback or rewards offer</p>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/admin/users')}
          >
            <span className="action-icon">👤</span>
            <h3>View Users</h3>
            <p>Manage user accounts and permissions</p>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/admin/analytics')}
          >
            <span className="action-icon">📊</span>
            <h3>View Analytics</h3>
            <p>Detailed reports and insights</p>
          </button>
        </div>
      </div>

      <div className="admin-info-section">
        <div className="info-card">
          <h3>🎯 Admin Portal Features</h3>
          <ul>
            <li>Manage credit cards and their details</li>
            <li>Create and update cashback offers</li>
            <li>Set offer rules and validity periods</li>
            <li>View user analytics and engagement</li>
            <li>Monitor system performance</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>📝 Getting Started</h3>
          <ul>
            <li>Navigate to "Manage Cards" to add credit cards</li>
            <li>Use "Manage Offers" to create promotional offers</li>
            <li>Check "Analytics" for user insights</li>
            <li>All changes are saved to Firebase in real-time</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
