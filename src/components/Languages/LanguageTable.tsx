import React, { useState } from 'react';
import { Language } from '../../types';
import { TableSkeleton } from '../common/TableSkeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBanner } from '../common/ErrorBanner';
import { Globe, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface LanguageTableProps {
  languages: Language[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onToggleStatus?: (langId: string | number, currentStatus: string) => void;
  onDeleteLanguage?: (langId: string | number, langName: string) => void;
  pageSize?: number;
}

export const LanguageTable: React.FC<LanguageTableProps> = ({
  languages,
  isLoading,
  error,
  onRetry,
  onToggleStatus,
  onDeleteLanguage,
  pageSize = 6,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (isLoading) {
    return (
      <div className="card">
        <TableSkeleton rows={pageSize} columns={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorBanner message={error} retryText="Retry" onRetry={onRetry} />
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<Globe size={32} />}
          title="No languages found"
          description="No languages available matching your search criteria."
        />
      </div>
    );
  }

  const totalPages = Math.ceil(languages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentLanguages = languages.slice(startIndex, startIndex + pageSize);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>ID</th>
              <th style={{ width: '48%' }}>Project / Language</th>
              <th style={{ width: '25%' }}>Status</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLanguages.map((lang) => {
              const isActive = (lang.status || 'Active').toLowerCase() === 'active';
              return (
                <tr key={lang.id}>
                  <td className="table-id-cell">{lang.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lang.name}
                      </span>
                      {lang.code && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            padding: '1px 6px',
                            background: '#f1f5f9',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {lang.code}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onToggleStatus && onToggleStatus(lang.id, lang.status)}
                      className={`status-badge ${isActive ? 'active' : 'inactive'}`}
                      style={{
                        cursor: onToggleStatus ? 'pointer' : 'default',
                        border: 'none',
                        background: isActive ? 'var(--success-subtle)' : '#f1f5f9',
                        color: isActive ? 'var(--success-text)' : 'var(--text-muted)',
                      }}
                      title={onToggleStatus ? 'Click to toggle status' : undefined}
                    >
                      <span className="status-dot" style={{ background: isActive ? 'var(--success)' : '#94a3b8' }} />
                      <span>{lang.status || 'Active'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {onToggleStatus && (
                        <button
                          type="button"
                          className="btn-icon-subtle"
                          onClick={() => onToggleStatus(lang.id, lang.status)}
                          title={`Switch to ${isActive ? 'Inactive' : 'Active'}`}
                        >
                          {isActive ? <ToggleRight size={18} color="var(--success)" /> : <ToggleLeft size={18} />}
                        </button>
                      )}

                      {onDeleteLanguage && (
                        <button
                          type="button"
                          className="btn-icon-subtle danger"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete language '${lang.name}'?`)) {
                              onDeleteLanguage(lang.id, lang.name);
                            }
                          }}
                          title="Delete Language"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <span>
            Showing <strong>{startIndex + 1}</strong> -{' '}
            <strong>{Math.min(startIndex + pageSize, languages.length)}</strong> of{' '}
            <strong>{languages.length}</strong> languages
          </span>
          <div className="pagination-controls">
            <button
              className="btn-page"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn-page"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
