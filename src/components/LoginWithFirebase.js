import { useState } from 'react';
import { signInWithGoogle } from '../config/firebase';
import logoSvg from '../assets/credit-card-logo.png.js';
import './Login.css';

const LoginWithFirebase = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await signInWithGoogle();

      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        memberSince: new Date().toISOString().split('T')[0],
        creditScore: 750,
        provider: 'google'
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authToken', user.accessToken);

      onLogin(userData);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        memberSince: new Date().toISOString().split('T')[0],
        creditScore: 750,
        provider: 'email'
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      onLogin(userData);
    } else {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        setError('No account found. Please sign up first.');
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.email !== formData.email || user.password !== formData.password) {
        setError('Invalid email or password');
        return;
      }

      localStorage.setItem('isLoggedIn', 'true');
      onLogin(user);
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
    const demoUser = {
      name: 'Diksha Kapoor',
      email: 'diksha@example.com',
      password: 'demo123',
      memberSince: '2022-01-15',
      creditScore: 785,
      provider: 'demo'
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
          <img
            src={logoSvg}
            alt="CardManager Logo"
            className="login-logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1>💳 CardManager</h1>
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

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="btn-google-signin"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="login-divider">
          <span>OR</span>
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

          <button type="submit" className="btn-login">
            {isSignUp ? 'Create Account' : 'Login'}
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

export default LoginWithFirebase;
