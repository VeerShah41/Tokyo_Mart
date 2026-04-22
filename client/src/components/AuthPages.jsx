import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const demoAccess = [
  {
    label: 'Customer Demo',
    email: 'user@tokyomart.com',
    password: 'User@123',
    note: 'Shopping, cart, checkout, and account orders',
  },
  {
    label: 'Admin Demo',
    email: 'admin@tokyomart.com',
    password: 'Admin@123',
    note: 'Inventory and admin dashboard access',
  },
];

export function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-1)', fontWeight: '700', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Tokyo Mart" className="brand-logo-img-large" />
          Tokyo Mart
        </Link>
      </div>

      <div className="auth-container">
        <h2>Sign in</h2>
        <p className="auth-helper">
          Demo customer aur admin credentials niche diye hue hain.
        </p>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Email or mobile phone number</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Continuing...' : 'Continue'}
          </button>
        </form>

        <p className="auth-disclaimer">
          By continuing, you agree to Tokyo Mart's Conditions of Use and Privacy Notice.
        </p>

        <div className="demo-login-grid">
          {demoAccess.map((account) => (
            <button
              key={account.label}
              type="button"
              className="demo-login-card"
              onClick={() => fillDemo(account)}
            >
              <span className="demo-login-label">{account.label}</span>
              <strong>{account.email}</strong>
              <code>{account.password}</code>
              <small>{account.note}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-divider">
        <span>New to Tokyo Mart?</span>
      </div>

      <Link to="/register" className="auth-secondary-btn">
        Create your Tokyo Mart account
      </Link>
    </div>
  );
}

export function RegisterPage({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role: 'customer' })
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
         <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-1)', fontWeight: '700', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Tokyo Mart" className="brand-logo-img-large" />
          Tokyo Mart
        </Link>
      </div>

      <div className="auth-container">
        <h2>Create account</h2>
        <p className="auth-helper">
          New users customer account se start karenge. Admin access demo admin login se available hai.
        </p>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="auth-field">
            <label>Your name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              placeholder="First and last name"
            />
          </div>

          <div className="auth-field">
            <label>Mobile number or email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="At least 6 characters"
            />
            <div style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <span style={{color: '#0f1111'}}>ℹ️ Passwords must be at least 6 characters.</span>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-disclaimer">
          By creating an account, you agree to Tokyo Mart's Conditions of Use and Privacy Notice.
        </p>

        <div className="auth-login-link" style={{ marginTop: '20px', fontSize: '0.9rem', padding: '20px 0 0', borderTop: '1px solid var(--border)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in ▶</Link>
        </div>
      </div>
    </div>
  );
}
