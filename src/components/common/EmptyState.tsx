import React from 'react';
import { Database, PlusCircle, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="empty-state-box">
      <div className="empty-icon-wrap">
        {icon || <Database size={28} />}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '380px', marginBottom: '18px' }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button className="btn-primary" style={{ width: 'auto', padding: '0 20px', height: '40px' }} onClick={onAction}>
          <PlusCircle size={16} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
