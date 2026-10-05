import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  ArrowRight,
  UserPlus,
  LogIn,
  Mail,
  KeyRound,
  RotateCcw,
  Pencil,
} from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();

  // Wizard step: 'details' -> 'otp'
  const [step, setStep] = useState<'details' | 'otp'>('details');

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Dataset Specialist');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP states
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Validate details & send OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);
    setSuccessInfo(null);

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

    setIsSendingOtp(true);
    try {
      await api.sendOtp(cleanUser);
      setStep('otp');
      setCountdown(60);
      setSuccessInfo(`Verification code sent to ${cleanUser}. Please check your inbox.`);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to send verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    clearError();
    setValidationError(null);
    setIsSendingOtp(true);
    try {
      await api.sendOtp(username.trim().toLowerCase());
      setCountdown(60);
      setSuccessInfo('A fresh verification code has been sent.');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to resend code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setValidationError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      await register(
        username.trim().toLowerCase(),
        password.trim(),
        name.trim(),
        role,
        cleanOtp
      );
    } catch {
      // Handled in AuthContext
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
                Secure registration with two-factor email OTP verification. Manage multilingual speech datasets and synthesize neural voices.
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
                    <KeyRound size={15} color="#38bdf8" />
                  </div>
                  <span>Verified email registration with 6-digit one-time passcodes</span>
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
          {/* STEP 1: Registration Credentials Form */}
          {step === 'details' && (
            <>
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
                  <span>Step 1 of 2: Account Details</span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Create Your Account
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Fill in your details. We'll send a 6-digit OTP code to verify your email.
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

              <form onSubmit={handleRequestOtp}>
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
                      disabled={isSendingOtp}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="register-username">
                    Email Address * (For OTP Verification)
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
                      disabled={isSendingOtp}
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
                    disabled={isSendingOtp}
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
                      disabled={isSendingOtp}
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
                      disabled={isSendingOtp}
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
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 size={18} className="spin-icon" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: 6-Digit OTP Verification Form */}
          {step === 'otp' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0d9488',
                    background: '#ccfbf1',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                  }}
                >
                  <KeyRound size={14} />
                  <span>Step 2 of 2: Email Verification</span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Verify Your Email
                </h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginTop: '8px',
                  }}
                >
                  <Mail size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                    {username}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('details');
                      clearError();
                      setValidationError(null);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.76rem',
                      color: 'var(--primary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    title="Change email address"
                  >
                    <Pencil size={12} />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              {/* Success Info Notice */}
              {successInfo && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '0.84rem',
                    color: '#065f46',
                  }}
                >
                  <CheckCircle2 size={16} color="#059669" />
                  <span>{successInfo}</span>
                </div>
              )}

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

              <form onSubmit={handleVerifyAndSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="register-otp">
                    6-Digit Verification Code
                  </label>
                  <div className="input-wrapper">
                    <KeyRound size={18} className="input-icon-left" />
                    <input
                      id="register-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="form-input has-icon"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                        if (activeError) setValidationError(null);
                      }}
                      style={{
                        letterSpacing: '8px',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Code expires in 5 minutes.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isSendingOtp}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.82rem',
                      color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <RotateCcw size={13} className={isSendingOtp ? 'spin-icon' : ''} />
                    <span>
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Verification Code'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Back to Details
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: '8px', height: '46px', fontSize: '0.98rem' }}
                  disabled={isLoading || otp.trim().length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="spin-icon" />
                      <span>Verifying & Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Complete Registration</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

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
