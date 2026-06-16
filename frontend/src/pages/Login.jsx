import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>
            <Sparkles size={20} color="white" />
          </div>
          <span style={styles.brandName}>ResuMetrics <span style={styles.brandAccent}>AI</span></span>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Enter your credentials to access your workspace</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        <p style={styles.switchPrompt}>
          Don't have an account? <Link to="/register" style={styles.switchLink}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070b13',
    backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
    padding: '1.5rem',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '2.5rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  brandLogo: {
    background: 'linear-gradient(135deg, #6366f1 0%, #db2777 100%)',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  brandAccent: {
    background: 'linear-gradient(135deg, #818cf8 0%, #db2777 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  title: {
    fontSize: '1.75rem',
    textAlign: 'center',
    marginBottom: '0.25rem',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    color: '#f87171',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  submitBtn: {
    width: '100%',
    height: '46px',
  },
  switchPrompt: {
    fontSize: '0.9rem',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '1.5rem',
  },
  switchLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: 600,
  }
};

export default Login;
