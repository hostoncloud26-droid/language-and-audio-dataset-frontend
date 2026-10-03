import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  retryText?: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  retryText = 'Retry',
  onRetry,
}) => {
  return (
    <div className="error-alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={18} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary"
          style={{ height: '32px', padding: '0 12px', fontSize: '0.8rem', background: 'white', borderColor: '#fca5a5', color: '#991b1b' }}
        >
          <RefreshCw size={14} />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
};
