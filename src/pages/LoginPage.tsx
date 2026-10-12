import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

import { AuthLoadingScreen } from '../components/common/AuthLoadingScreen';

interface LoginPageProps {
  onNavigateToRegister?: () => void;
  isAdminPortal?: boolean;
  onAdminSwitch?: (isAdmin: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  isAdminPortal = false,
  onAdminSwitch,
}) => {
  const { login, adminLogin, isLoading, error, clearError } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const userVal = username.trim();
    const passVal = password.trim();

    if (!userVal) {
      setValidationError(
        isAdminPortal
          ? 'Enter your administrator ID.'
          : 'Enter your email or username.'
      );
      return;
    }
    if (!passVal) {
      setValidationError('Enter your password.');
      return;
    }

    setIsAuthenticating(true);

    try {
      // Execute the authentication in parallel with creative Apple loading animation
      await Promise.all([
        isAdminPortal ? adminLogin(userVal, passVal) : login(userVal, passVal),
        new Promise((resolve) => setTimeout(resolve, 1450)),
      ]);
    } catch {
      setIsAuthenticating(false);
    }
  };

  const activeError = validationError || error;

  if (isAuthenticating) {
    return <AuthLoadingScreen isAdmin={isAdminPortal} />;
  }

  return (
    <div className="login-container">
      <div className="login-card-centered">
        {/* Animated laser progress strip while authenticating */}
        {isLoading && <div className="login-card-loader-bar" />}

        {/* Clean Header */}
        <div className="login-header-clean">
          <div className="login-brand-clean">
            <div className="login-logo-clean">
              <Mic size={20} />
            </div>
            <div>
              <h1 className="login-title-clean">
                {isAdminPortal ? 'Allo Audio Dataset • Admin' : 'Allo Audio Dataset'}
              </h1>
            </div>
          </div>

          {isAdminPortal && (
            <div className="login-admin-badge">
              <ShieldAlert size={12} color="#fbbf24" />
              <span>Restricted Portal</span>
            </div>
          )}

          <p className="login-subtitle-clean">
            {isAdminPortal
              ? 'Administrator authentication required.'
              : 'Sign in to access your projects and recordings.'}
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
              style={{ color: 'inherit', padding: '0 4px', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Clean Form */}
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="login-username">
              {isAdminPortal ? 'Administrator ID *' : 'Email or Username *'}
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input-clean"
              placeholder={isAdminPortal ? 'Enter admin ID' : 'Enter email or username'}
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

          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="login-password">
              Password *
            </label>
            <div className="input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input-clean"
                style={{ paddingRight: '40px' }}
                placeholder="Enter password"
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
                style={{ right: '10px' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-purple-apple"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>{isAdminPortal ? 'Verifying Clearance...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                {isAdminPortal ? <ShieldCheck size={16} /> : null}
                <span>{isAdminPortal ? 'Authenticate Administrator' : 'Login'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="login-footer-links">
          {isAdminPortal ? (
            <button
              type="button"
              className="admin-subtle-link"
              onClick={() => onAdminSwitch?.(false)}
            >
              ← Return to User Login
            </button>
          ) : (
            <>
              {onNavigateToRegister && (
                <div className="login-footer-text">
                  New to Allo?{' '}
                  <button
                    type="button"
                    className="login-link-btn"
                    onClick={onNavigateToRegister}
                  >
                    Register
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
