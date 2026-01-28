import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/credit-card-logo.png';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmail(email, password);
      const user = userCredential.user;

      // Check if user has admin role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData?.isAdmin) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Store admin session
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: userData.name
      }));

      // Navigate to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);

      // Handle specific Firebase errors
      if (err.code === 'auth/user-not-found') {
        setError('No admin account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-logo">
          <img
            src={logo}
            alt="CardManager Admin"
            className="admin-logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="admin-logo-text" style={{ display: 'none' }}>🔐 Admin Portal</div>
        </div>

        <h2 className="admin-login-title">Admin Portal</h2>
        <p className="admin-login-subtitle">Sign in to manage credit cards and offers</p>

        {error && (
          <div className="admin-error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              'Login to Admin Portal'
            )}
          </button>
        </form>

        <div className="admin-footer">
          <button
            className="back-to-app-link"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            ← Back to User Login
          </button>
        </div>

        <div className="admin-info-box">
          <p><strong>Admin Access Only</strong></p>
          <p>This portal is restricted to authorized administrators for managing credit card information, offers, and system settings.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
