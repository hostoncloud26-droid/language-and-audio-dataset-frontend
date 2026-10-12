import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

import { AuthLoadingScreen } from '../components/common/AuthLoadingScreen';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

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

    setIsAuthenticating(true);

    try {
      await Promise.all([
        register(cleanUser, cleanPass, cleanName),
        new Promise((resolve) => setTimeout(resolve, 1450)),
      ]);
    } catch {
      setIsAuthenticating(false);
    }
  };

  const activeError = validationError || error;

  if (isAuthenticating) {
    return <AuthLoadingScreen isAdmin={false} />;
  }

  return (
    <div className="login-container">
      <div className="login-card-centered">
        {/* Top loading bar */}
        {isLoading && <div className="login-card-loader-bar" />}

        {/* Clean Header */}
        <div className="login-header-clean">
          <div className="login-brand-clean">
            <div className="login-logo-clean">
              <Mic size={20} />
            </div>
            <div>
              <h1 className="login-title-clean">Allo Audio Dataset</h1>
            </div>
          </div>
          <p className="login-subtitle-clean">
            Create an account to contribute speech recordings.
          </p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="error-alert" style={{ marginBottom: '18px' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.86rem' }}>{activeError}</div>
            <button
              type="button"
              onClick={() => {
                clearError();
                setValidationError(null);
              }}
              style={{
                color: 'inherit',
                padding: '0 4px',
                fontSize: '1.1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="register-name">
              Full Name *
            </label>
            <input
              id="register-name"
              type="text"
              className="form-input-clean"
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

          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="register-username">
              Email Address *
            </label>
            <input
              id="register-username"
              type="email"
              className="form-input-clean"
              placeholder="e.g. alex@example.com"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (activeError) setValidationError(null);
              }}
              disabled={isLoading}
            />
          </div>

          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="register-password">
              Password *
            </label>
            <div className="input-wrapper">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input-clean"
                style={{ paddingRight: '40px' }}
                placeholder="Create password (min 4 characters)"
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
                style={{ right: '10px' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="register-confirm-password">
              Confirm Password *
            </label>
            <div className="input-wrapper">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input-clean"
                style={{ paddingRight: '40px' }}
                placeholder="Re-enter password"
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
                style={{ right: '10px' }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-purple-apple"
            style={{ marginTop: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login Link */}
        <div className="login-footer-links">
          <div className="login-footer-text">
            Already have an account?{' '}
            <button
              type="button"
              className="login-link-btn"
              onClick={onNavigateToLogin}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
