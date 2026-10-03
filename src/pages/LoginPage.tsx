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
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, isLoading, error, clearError } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('janu09@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Dataset Specialist');

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleQuickFill = (user: string, pass: string) => {
    setTab('login');
    setUsername(user);
    setPassword(pass);
    clearError();
    setValidationError(null);
  };

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!regUsername.trim()) {
      setValidationError('Username / Email is required for registration.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setValidationError('Password must be at least 4 characters long.');
      return;
    }

    try {
      await register(regUsername.trim(), regPassword.trim(), regName.trim(), regRole);
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
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
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
                  <span>Instant harmonic voice generation across English, Tamil & Hindi</span>
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
          <div className="hero-footer" style={{ justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              v1.0.0
            </span>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="login-form-pane">
          {/* Sign In vs Register Switcher */}
          <div className="login-tab-switcher">
            <button
              type="button"
              className={`login-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setTab('login');
                clearError();
                setValidationError(null);
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <LogIn size={15} />
                <span>Sign In</span>
              </div>
            </button>
            <button
              type="button"
              className={`login-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setTab('register');
                clearError();
                setValidationError(null);
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={15} />
                <span>Create Account</span>
              </div>
            </button>
          </div>

          {/* Quick Demo Credentials Pill Bar */}
          {tab === 'login' && (
            <div className="quick-credentials-box">
              <div className="quick-credentials-header">
                <span>Quick Credentials:</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>1-Click Fill</span>
              </div>
              <div className="quick-chips-row">
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickFill('janu09@gmail.com', 'password123')}
                  title="Fill Janu specialist credentials"
                >
                  <Sparkles size={12} color="#0284c7" />
                  <span>Janu (Specialist)</span>
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickFill('admin', 'admin123')}
                  title="Fill Administrator credentials"
                >
                  <ShieldCheck size={12} color="#0d9488" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickFill('specialist', 'DatasetUser@2026!')}
                  title="Fill Specialist credentials"
                >
                  <UserIcon size={12} color="#6366f1" />
                  <span>Specialist</span>
                </button>
              </div>
            </div>
          )}

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

          {/* Tab 1: SIGN IN FORM */}
          {tab === 'login' && (
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
                    placeholder="e.g. janu09@gmail.com, admin"
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
                style={{ marginTop: '16px', height: '46px', fontSize: '0.98rem' }}
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
          )}

          {/* Tab 2: CREATE ACCOUNT FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="input-wrapper">
                  <UserIcon size={18} className="input-icon-left" />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input has-icon"
                    placeholder="e.g. Janu S"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-username">
                  Username or Email
                </label>
                <div className="input-wrapper">
                  <UserIcon size={18} className="input-icon-left" />
                  <input
                    id="reg-username"
                    type="text"
                    className="form-input has-icon"
                    placeholder="e.g. janu09@gmail.com"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">
                  Platform Role
                </label>
                <select
                  id="reg-role"
                  className="dataset-select"
                  style={{ width: '100%', height: '44px' }}
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Dataset Specialist">Dataset Specialist</option>
                  <option value="Speech Annotator">Speech Annotator</option>
                  <option value="Dataset Reviewer">Dataset Reviewer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input has-icon"
                    placeholder="Choose password (min 4 characters)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
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
                style={{ marginTop: '16px', height: '46px', fontSize: '0.98rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Sign In</span>
                    <CheckCircle2 size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Platform Footer */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Language & Audio Dataset Collection Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
