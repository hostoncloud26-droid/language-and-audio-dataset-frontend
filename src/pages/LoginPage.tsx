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
  ShieldAlert,
  Server,
  FileSpreadsheet,
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const { login, adminLogin, isLoading, error, clearError } = useAuth();

  // Portal selection: standard Contributor vs dedicated Administrator
  const [portalMode, setPortalMode] = useState<'contributor' | 'admin'>('contributor');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePortalSwitch = (mode: 'contributor' | 'admin') => {
    setPortalMode(mode);
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
      setValidationError(
        portalMode === 'admin'
          ? 'Please enter your Administrator username or email.'
          : 'Please enter your Contributor username or email.'
      );
      return;
    }
    if (!passVal) {
      setValidationError('Please enter your account password.');
      return;
    }

    try {
      if (portalMode === 'admin') {
        await adminLogin(userVal, passVal);
      } else {
        await login(userVal, passVal);
      }
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
                  Speech Corpus Infrastructure
                </span>
              </div>
            </div>

            <div className="hero-content">
              <h1 className="hero-title">
                Enterprise Speech & Acoustic{' '}
                <span className="hero-title-highlight">Data Platform</span>
              </h1>
              <p className="hero-desc">
                Enterprise platform for collecting, synthesizing, validating, and curating
                multilingual speech corpora with secure PostgreSQL persistence and auditable storage.
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

              {/* Enterprise Feature Highlights */}
              <div className="hero-features-list">
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <Layers size={15} color="#38bdf8" />
                  </div>
                  <span>Isolated Contributor Workspaces with Strict Personal Data Ownership</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <ShieldCheck size={15} color="#34d399" />
                  </div>
                  <span>Separate Administrator Supervisory Portal with Global Corpus Oversight</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <Volume2 size={15} color="#a7f3d0" />
                  </div>
                  <span>Edge-TTS Neural Voice Synthesis & High-Fidelity Microphone Capture</span>
                </div>
                <div className="hero-feature-item">
                  <div className="hero-feature-icon">
                    <Server size={15} color="#fcd34d" />
                  </div>
                  <span>Bcrypt Encrypted Authentication & JWT Cryptographic Session Tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Footer */}
          <div className="hero-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Dataset Contributor Program
            </span>
            {onNavigateToRegister && portalMode === 'contributor' && (
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
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <UserPlus size={14} />
                <span>Register Contributor</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="login-form-pane">
          {/* Top Portal Switcher (Clean, strict portal separation) */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '24px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => handlePortalSwitch('contributor')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                background: portalMode === 'contributor' ? '#ffffff' : 'transparent',
                color: portalMode === 'contributor' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: portalMode === 'contributor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <UserIcon size={16} />
              <span>Contributor Login</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                background: portalMode === 'admin' ? '#0f172a' : 'transparent',
                color: portalMode === 'admin' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: portalMode === 'admin' ? '0 2px 6px rgba(15,23,42,0.2)' : 'none',
              }}
            >
              <ShieldCheck size={16} color={portalMode === 'admin' ? '#38bdf8' : 'currentColor'} />
              <span>Administrator Portal</span>
            </button>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '22px' }}>
            {portalMode === 'admin' ? (
              <>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    background: '#e2e8f0',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    border: '1px solid #cbd5e1',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  <ShieldAlert size={14} color="#dc2626" />
                  <span>Restricted Access • Administrator Clearance</span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                  System Administrator Sign In
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supervisory authentication. Grants global access to inspect every contributor's
                  recordings, audit acoustic quality, and manage datasets.
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'var(--primary-subtle)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                  }}
                >
                  <LogIn size={14} />
                  <span>Contributor Workspace</span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Sign In to Your Workspace
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Access your personal audio uploads, voice recordings, and task contributions.
                </p>
              </>
            )}
          </div>

          {/* Error Alert */}
          {activeError && (
            <div className="error-alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.88rem' }}>{activeError}</div>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setValidationError(null);
                }}
                style={{ color: 'inherit', padding: '2px 4px', fontSize: '1.1rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
                title="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* SIGN IN FORM (Strict, role-free authentication) */}
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">
                {portalMode === 'admin' ? 'Administrator ID / Email' : 'Username or Email Address'}
              </label>
              <div className="input-wrapper">
                {portalMode === 'admin' ? (
                  <ShieldCheck size={18} className="input-icon-left" color="#0f172a" />
                ) : (
                  <UserIcon size={18} className="input-icon-left" />
                )}
                <input
                  id="login-username"
                  type="text"
                  className="form-input has-icon"
                  placeholder={
                    portalMode === 'admin'
                      ? 'Enter system administrator username'
                      : 'Enter your registered username or email'
                  }
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
                  {portalMode === 'admin' ? 'Administrator Password' : 'Account Password'}
                </label>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon"
                  placeholder="Enter security password"
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

            {portalMode === 'admin' ? (
              <button
                type="submit"
                className="btn-primary"
                style={{
                  marginTop: '20px',
                  height: '46px',
                  fontSize: '0.96rem',
                  background: '#0f172a',
                  color: '#ffffff',
                  borderColor: '#0f172a',
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Verifying Administrator Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} color="#38bdf8" />
                    <span>Authenticate Administrator</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: '20px', height: '46px', fontSize: '0.96rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Contributor Workspace</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            )}
          </form>

          {/* Switch to Register (Shown strictly in Contributor mode) */}
          {portalMode === 'contributor' && onNavigateToRegister && (
            <div
              style={{
                marginTop: '26px',
                textAlign: 'center',
                paddingTop: '18px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                New contributor?{' '}
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
                  Create Contributor Account
                </button>
              </p>
            </div>
          )}

          {/* Administrator security note */}
          {portalMode === 'admin' && (
            <div
              style={{
                marginTop: '22px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#64748b',
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: '#0f172a' }}>Security Notice:</strong> Administrator logins
              are strictly reserved for platform supervisors. Contributors cannot log in through
              this portal. All sessions are logged with cryptographic verification.
            </div>
          )}

          {/* Platform Footer */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Language & Audio Dataset Platform • Enterprise Curation System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
