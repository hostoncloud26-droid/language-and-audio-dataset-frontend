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
  Volume2,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  Mail,
  Sparkles,
} from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Dataset Specialist');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const cleanName = name.trim();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!cleanUser || !cleanUser.includes('@') || !cleanUser.includes('.')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (cleanPass.length < 4) {
      setValidationError('Password must be at least 4 characters long.');
      return;
    }
    if (cleanPass !== confirmPassword.trim()) {
      setValidationError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      await register(cleanUser, cleanPass, cleanName, role);
    } catch {
      // Error handled in AuthContext
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
                Create Your <span className="hero-title-highlight">Account</span>
              </h1>
              <p className="hero-desc">
                Instant access to acoustic datasets, voice synthesis, and multilingual speech annotations.
              </p>

              {/* Animated Soundwave Visual */}
              <div className="hero-soundwave">
                {[14, 26, 34, 18, 30, 22, 12, 28, 36, 20, 16, 32, 24, 14, 30, 26, 18, 22, 34, 16].map((h, i) => (
                  <div
                    key={i}
                    className="hero-wave-bar"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${(i * 0.07).toFixed(2)}s`,
                      opacity: 0.6 + (i % 4) * 0.1,
                    }}
                  />
                ))}
              </div>

              {/* Feature Highlights */}
              <div className="hero-features-list">
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <Sparkles size={15} color="#38bdf8" />
                  </div>
                  <span>Instant access to audio collection and annotation tools</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <Volume2 size={15} color="#a7f3d0" />
                  </div>
                  <span>Neural Text-to-Speech synthesis with voice preview</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <ShieldCheck size={15} color="#fcd34d" />
                  </div>
                  <span>PostgreSQL persistence & JWT signed authentication</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Already registered?
            </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
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
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="login-form-pane">
          <div style={{ marginBottom: '20px' }}>
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
              <UserPlus size={14} />
              <span>Account Registration</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Create Your Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enter your details to create an account and access the dataset platform.
            </p>
          </div>

          {/* Error Alert */}
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name *
              </label>
              <div className="input-wrapper">
                <UserIcon size={18} className="input-icon-left" />
                <input
                  id="register-name"
                  type="text"
                  className="form-input has-icon"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (activeError) setValidationError(null);
                  }}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-username">
                Email Address *
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon-left" />
                <input
                  id="register-username"
                  type="email"
                  className="form-input has-icon"
                  placeholder="e.g. alex@example.com"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (activeError) setValidationError(null);
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-role">
                Platform Role
              </label>
              <select
                id="register-role"
                className="dataset-select"
                style={{ width: '100%', height: '44px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="Dataset Specialist">Dataset Specialist</option>
                <option value="Speech Annotator">Speech Annotator</option>
                <option value="Dataset Reviewer">Dataset Reviewer</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password * (min 4 characters)
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon"
                  placeholder="Create your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (activeError) setValidationError(null);
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

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm Password *
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input has-icon"
                  placeholder="Re-enter password to confirm"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (activeError) setValidationError(null);
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-btn-right"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Link */}
          <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
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
                Sign In here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
