import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Dashboard from './components/Dashboard';
import Cards from './components/Cards';
import Expenses from './components/Expenses';
import CardRecommendation from './components/CardRecommendation';
import Reviews from './components/Reviews';
import Login from './components/Login';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ConfirmDialog from './components/ConfirmDialog';
import AppTour from './components/AppTour';
import { updateUserProfile } from './config/firebase';
import logo from './assets/credit-card-logo.png';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isLoading, user, logout, updateUser } = useApp();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Don't interfere with admin routes
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsAuthenticated(loggedIn === 'true');

    // Listen for storage changes (for logout across tabs)
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn');
      setIsAuthenticated(loggedIn === 'true');
      if (loggedIn !== 'true') {
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, location.pathname]);

  // Check if user should see tour
  useEffect(() => {
    if (user && isAuthenticated && !location.pathname.startsWith('/admin')) {
      // Check if user has seen tour
      if (user.hasSeenTour === false) {
        // Small delay to allow UI to render
        setTimeout(() => setShowTour(true), 500);
      }
    }
  }, [user, isAuthenticated, location.pathname]);

  const handleLogin = (userData) => {
    updateUser(userData);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleTourComplete = async () => {
    setShowTour(false);
    if (user?.uid) {
      try {
        await updateUserProfile(user.uid, { hasSeenTour: true });
        updateUser({ ...user, hasSeenTour: true });
      } catch (error) {
        console.error('Error updating tour status:', error);
      }
    }
  };

  const confirmLogout = () => {
    // Clear authentication first
    logout();
    setIsAuthenticated(false);

    // Force navigation to login
    navigate('/login', { replace: true });

    // Force re-render by clearing location state
    window.history.replaceState(null, '', '/login');
    setShowLogoutDialog(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Show login page if not authenticated (but don't interfere with admin routes)
  if (!isAuthenticated && location.pathname !== '/login' && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && isAuthenticated) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your credit cards...</p>
      </div>
    );
  }

  return (
    <>
      {showTour && <AppTour onComplete={handleTourComplete} />}

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Logout Confirmation"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <Routes>
        {/* Admin Routes - Must come first to avoid being caught by user routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* User Login Route */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
        } />

        {/* User App Routes */}
        <Route path="*" element={
          isAuthenticated ? (
            <div className="App">
            <nav className="sidebar">
              <div className="app-logo">
                <img
                  src={logo}
                  alt="CardManager Logo"
                  className="logo-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <h1 className="logo-text" style={{ display: 'none' }}>💳 CardManager</h1>
                <p>Smart Credit Card Management</p>
              </div>

              <div className="user-profile">
                <div className="user-avatar">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="avatar-img" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="user-info">
                  <h4>{user?.name || 'User'}</h4>
                  <p>{user?.email || 'user@example.com'}</p>
                </div>
              </div>

              <div className="nav-menu">
                <div
                  className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <span className="nav-icon">📊</span>
                  <span>Dashboard</span>
                </div>

                <div
                  className={`nav-item ${location.pathname === '/cards' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/cards')}
                >
                  <span className="nav-icon">💳</span>
                  <span>My Cards</span>
                </div>

                <div
                  className={`nav-item ${location.pathname === '/expenses' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/expenses')}
                >
                  <span className="nav-icon">💰</span>
                  <span>Expenses</span>
                </div>

                <div
                  className={`nav-item ${location.pathname === '/recommend' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/recommend')}
                >
                  <span className="nav-icon">🎯</span>
                  <span>Recommendations</span>
                </div>

                <div
                  className={`nav-item ${location.pathname === '/reviews' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/reviews')}
                >
                  <span className="nav-icon">⭐</span>
                  <span>Reviews</span>
                </div>

                <div className="nav-item" onClick={handleLogout}>
                  <span className="nav-icon">🚪</span>
                  <span>Logout</span>
                </div>

                {user?.isAdmin && (
                  <div className="nav-item admin-access" onClick={() => {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    localStorage.setItem('adminUser', JSON.stringify({
                      uid: user.uid,
                      email: user.email,
                      name: user.name
                    }));
                    navigate('/admin/dashboard');
                  }}>
                    <span className="nav-icon">🔐</span>
                    <span>Admin Portal</span>
                  </div>
                )}
              </div>

              <div className="sidebar-footer">
                <div className="credit-score-widget">
                  <p className="widget-label">Credit Score</p>
                  <h3 className="credit-score">{user?.creditScore || 'Not Set'}</h3>
                  <p className="widget-status">{user?.creditScore ? 'Excellent' : 'Add your score'}</p>
                </div>
              </div>
            </nav>

            <main className="main-content">
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="cards" element={<Cards />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="recommend" element={<CardRecommendation />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;
