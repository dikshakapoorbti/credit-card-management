import { useState } from 'react';
import { signUpWithEmail, signInWithEmail } from '../config/firebase';
import logo from '../assets/credit-card-logo.png';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up - create new user
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Create user in Firebase
        const { userData } = await signUpWithEmail(
          formData.email,
          formData.password,
          formData.name
        );

        // Store in localStorage and login
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        onLogin(userData);
      } else {
        // Login - verify user
        if (!formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        // Sign in with Firebase
        const { userData } = await signInWithEmail(
          formData.email,
          formData.password
        );

        if (!userData) {
          setError('User profile not found. Please contact support.');
          setLoading(false);
          return;
        }

        // Store in localStorage and login
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        onLogin(userData);
      }
    } catch (error) {
      console.error('Authentication error:', error);

      // Handle Firebase-specific errors
      if (error.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled. Please enable it in Firebase Console: Build → Authentication → Sign-in method → Email/Password → Enable');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Authentication failed. Please try again.');
      }

      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleDemoLogin = () => {
    // Demo login with pre-filled data
    const demoUser = {
      name: 'Diksha Kapoor',
      email: 'diksha@example.com',
      password: 'demo123',
      memberSince: '2022-01-15',
      creditScore: 785
    };

    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('isLoggedIn', 'true');
    onLogin(demoUser);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="CardManager Logo" className="login-logo" />
          <h1>CardManager</h1>
          <p>Smart Credit Card Management</p>
        </div>

        <div className="login-tabs">
          <button
            className={!isSignUp ? 'active' : ''}
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
          >
            Login
          </button>
          <button
            className={isSignUp ? 'active' : ''}
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          {isSignUp && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Login')}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <button onClick={handleDemoLogin} className="btn-demo">
          Try Demo Account
        </button>

        <div className="login-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="login-features">
          <div className="feature">
            <span>🎯</span>
            <p>Smart Card Recommendations</p>
          </div>
          <div className="feature">
            <span>📊</span>
            <p>Expense Tracking</p>
          </div>
          <div className="feature">
            <span>💰</span>
            <p>Rewards Maximization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
