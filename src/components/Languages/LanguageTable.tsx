import React, { useState } from 'react';
import { Language } from '../../types';
import { TableSkeleton } from '../common/TableSkeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBanner } from '../common/ErrorBanner';
import { Globe, Trash2, ToggleLeft, ToggleRight, Download, Loader2 } from 'lucide-react';

interface LanguageTableProps {
  languages: Language[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onToggleStatus?: (langId: string | number, currentStatus: string) => void;
  onDeleteLanguage?: (langId: string | number, langName: string) => void;
  onDownloadLanguage?: (language: Language) => void;
  downloadingLangId?: string | number | null;
  pageSize?: number;
}

export const LanguageTable: React.FC<LanguageTableProps> = ({
  languages,
  isLoading,
  error,
  onRetry,
  onToggleStatus,
  onDeleteLanguage,
  onDownloadLanguage,
  downloadingLangId = null,
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
          title="No projects found"
          description="No projects available matching your search criteria."
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
              <th style={{ width: '10%' }}>ID</th>
              <th style={{ width: '38%' }}>Project</th>
              <th style={{ width: '20%' }}>Status</th>
              <th style={{ width: '32%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLanguages.map((lang, index) => {
              const isActive = (lang.status || 'Active').toLowerCase() === 'active';
              // Ensure clean sequential ID, preventing raw timestamp IDs like 1791818029590
              const displayId =
                typeof lang.id === 'number' && lang.id < 10000
                  ? lang.id
                  : !isNaN(Number(lang.id)) && Number(lang.id) < 10000
                  ? Number(lang.id)
                  : startIndex + index + 1;

              return (
                <tr key={lang.id}>
                  <td className="table-id-cell">{displayId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lang.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onToggleStatus && onToggleStatus(lang.id, lang.status)}
                      className={`status-badge ${isActive ? 'active' : 'inactive'}`}
                      style={{
                        cursor: onToggleStatus ? 'pointer' : 'default',
                        border: isActive ? 'none' : '1px solid #28283a',
                        background: isActive ? 'var(--success-subtle)' : '#181822',
                        color: isActive ? 'var(--success-text)' : 'var(--text-muted)',
                      }}
                      title={onToggleStatus ? 'Click to toggle status' : undefined}
                    >
                      <span className="status-dot" style={{ background: isActive ? 'var(--success)' : '#94a3b8' }} />
                      <span>{lang.status || 'Active'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      {onDownloadLanguage && (
                        <button
                          type="button"
                          className="btn-icon-subtle"
                          onClick={() => onDownloadLanguage(lang)}
                          disabled={downloadingLangId === lang.id}
                          title={`Download ${lang.name} recordings ZIP archive`}
                        >
                          {downloadingLangId === lang.id ? (
                            <Loader2 size={14} className="spin-icon" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
                      )}

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
                            if (window.confirm(`Are you sure you want to delete project '${lang.name}'?`)) {
                              onDeleteLanguage(lang.id, lang.name);
                            }
                          }}
                          title="Delete Project"
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
            <strong>{languages.length}</strong> projects
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
