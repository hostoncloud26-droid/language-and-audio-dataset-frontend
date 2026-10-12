import React, { useState, useEffect } from 'react';
import { Mic, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthLoadingScreenProps {
  isAdmin?: boolean;
  onAnimationFinished?: () => void;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  isAdmin = false,
  onAnimationFinished,
}) => {
  const [progress, setProgress] = useState<number>(12);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const steps = isAdmin
    ? [
        'Verifying administrator credentials...',
        'Validating cryptographic clearance...',
        'Decrypting global dataset repository...',
        'Clearance granted • Opening Admin Portal...',
      ]
    : [
        'Authenticating credentials...',
        'Establishing secure workspace session...',
        'Loading personal audio recordings...',
        'Authentication complete • Welcome to Allo Audio Dataset...',
      ];

  useEffect(() => {
    // Smooth progress ticker
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const delta = Math.floor(Math.random() * 12) + 14;
        return Math.min(100, prev + delta);
      });
    }, 240);

    // Step message progression
    const step1 = setTimeout(() => setCurrentStepIndex(1), 380);
    const step2 = setTimeout(() => setCurrentStepIndex(2), 750);
    const step3 = setTimeout(() => setCurrentStepIndex(3), 1150);
    const finish = setTimeout(() => {
      if (onAnimationFinished) {
        onAnimationFinished();
      }
    }, 1450);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(finish);
    };
  }, [onAnimationFinished]);

  return (
    <div className="auth-loading-overlay">
      {/* Ambient background glow */}
      <div className="auth-loading-radial-glow" />

      <div className="auth-loading-content">
        {/* Apple Resonance Orb & Waveform Rings */}
        <div className="auth-orb-wrapper">
          {/* Concentric Sonar Rings */}
          <div className="auth-sonar-ring ring-1" />
          <div className="auth-sonar-ring ring-2" />
          <div className="auth-sonar-ring ring-3" />

          {/* Rotating Orbital Track */}
          <div className="auth-orbital-ring" />

          {/* Central Illuminated Emblem */}
          <div className="auth-core-emblem">
            {isAdmin ? (
              <ShieldCheck size={36} color="#ffffff" className="auth-core-icon" />
            ) : (
              <Mic size={36} color="#ffffff" className="auth-core-icon" />
            )}
          </div>
        </div>

        {/* Live Audio Equalizer Waveform Bars */}
        <div className="auth-equalizer-bars">
          {[16, 28, 42, 32, 48, 26, 38, 20, 34, 18, 30].map((h, i) => (
            <div
              key={i}
              className="auth-eq-bar"
              style={{
                height: `${h}px`,
                animationDelay: `${(i * 0.08).toFixed(2)}s`,
              }}
            />
          ))}
        </div>

        {/* Typography & Brand */}
        <div className="auth-loading-texts">
          <div className="auth-loading-brand">
            <span className="auth-brand-name">Allo Audio Dataset</span>
            {isAdmin && <span className="auth-admin-chip">Administrator</span>}
          </div>

          <p className="auth-step-message" key={currentStepIndex}>
            {steps[currentStepIndex]}
          </p>
        </div>

        {/* Apple Laser Progress Bar */}
        <div className="auth-progress-track">
          <div
            className="auth-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Percentage Counter */}
        <div className="auth-progress-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={11} color="#a855f7" />
            Secure Authentication
          </span>
          <span className="auth-percent-number">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
