import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Layers,
  Volume2,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();

  // Login form state - clean, no demo pre-fill
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const userVal = username.trim();
    const passVal = password.trim();

    if (!userVal) {
      setValidationError('Please enter your username or email address.');
      return;
    }
    if (!passVal) {
      setValidationError('Please enter your account password.');
      return;
    }

    try {
      await login(userVal, passVal);
    } catch {
      // Handled in auth context
    }
  };

  const activeError = validationError || error;

  return (
    <div className="login-container">
      <div className="login-split-card">
        {/* Left Hero Pane */}
        <div className="login-hero-pane">
          <div>
            <div className="hero-brand">
              <div className="hero-brand-icon">
                <Mic size={24} />
              </div>
              <div>
                <span className="hero-brand-name">Dataset Platform</span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    color: '#93c5fd',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                  }}
                >
                  Acoustic Intelligence
                </span>
              </div>
            </div>

            <div className="hero-content">
              <h1 className="hero-title">
                Multilingual Speech & Audio <span className="hero-title-highlight">Data Platform</span>
              </h1>
              <p className="hero-desc">
                High-performance platform for collecting, synthesizing, annotating, and reviewing multilingual speech datasets with seamless PostgreSQL storage.
              </p>

              {/* Animated Soundwave Visual */}
              <div className="hero-soundwave">
                {[18, 28, 12, 34, 22, 14, 30, 24, 16, 32, 20, 10, 26, 36, 18, 28, 14, 24, 32, 16].map((h, i) => (
                  <div
                    key={i}
                    className="hero-wave-bar"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${(i * 0.08).toFixed(2)}s`,
                      opacity: 0.6 + (i % 4) * 0.1,
                    }}
                  />
                ))}
              </div>

              {/* Feature Highlights */}
              <div className="hero-features-list">
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <Layers size={15} color="#38bdf8" />
                  </div>
                  <span>High-performance multilingual speech corpus management</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <Volume2 size={15} color="#a7f3d0" />
                  </div>
                  <span>Instant neural voice generation across English, Tamil & Hindi</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <ShieldCheck size={15} color="#fcd34d" />
                  </div>
                  <span>Bcrypt secure hashing & JWT signed authentication</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Footer */}
          <div className="hero-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              New to Dataset Platform?
            </span>
            {onNavigateToRegister && (
              <button
                type="button"
                onClick={onNavigateToRegister}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                }}
              >
                <UserPlus size={14} />
                <span>Create Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="login-form-pane">
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-subtle)',
                padding: '4px 10px',
                borderRadius: '6px',
                marginBottom: '8px',
              }}
            >
              <LogIn size={14} />
              <span>Secure Sign In</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enter your credentials to access the audio datasets dashboard.
            </p>
          </div>

          {/* Error Alert with Close button */}
          {activeError && (
            <div className="error-alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{activeError}</div>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setValidationError(null);
                }}
                style={{ color: 'inherit', padding: '2px 4px', fontSize: '1.1rem', lineHeight: 1 }}
                title="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* SIGN IN FORM */}
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">
                Username or Email
              </label>
              <div className="input-wrapper">
                <UserIcon size={18} className="input-icon-left" />
                <input
                  id="login-username"
                  type="text"
                  className="form-input has-icon"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (activeError) {
                      clearError();
                      setValidationError(null);
                    }
                  }}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon"
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (activeError) {
                      clearError();
                      setValidationError(null);
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-btn-right"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: '20px', height: '46px', fontSize: '0.98rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          {onNavigateToRegister && (
            <div
              style={{
                marginTop: '28px',
                textAlign: 'center',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  style={{
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 'inherit',
                  }}
                >
                  Create an Account
                </button>
              </p>
            </div>
          )}

          {/* Platform Footer */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Language & Audio Dataset Collection Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
