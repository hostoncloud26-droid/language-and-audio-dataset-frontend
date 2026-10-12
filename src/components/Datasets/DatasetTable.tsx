import React, { useState } from 'react';
import { DatasetRecord } from '../../types';
import { DatasetRow } from './DatasetRow';
import { TableSkeleton } from '../common/TableSkeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBanner } from '../common/ErrorBanner';
import { Mic, Clock, FileAudio, Download, FileText, Users } from 'lucide-react';

interface DatasetTableProps {
  records: DatasetRecord[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigateToCollect: () => void;
  onDeleteRecord?: (recordId: string) => void;
  onUpdateRecord?: (recordId: string, newText: string) => Promise<void>;
  pageSize?: number;
  isAdmin?: boolean;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({
  records,
  isLoading,
  error,
  onRetry,
  onNavigateToCollect,
  onDeleteRecord,
  onUpdateRecord,
  pageSize = 6,
  isAdmin = false,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (isLoading) {
    return (
      <div className="card">
        <TableSkeleton rows={pageSize} columns={isAdmin ? 7 : 6} />
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

  if (records.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<Mic size={32} />}
          title={isAdmin ? "No contributor audio recordings found." : "No uploaded audio recordings yet."}
          description={
            isAdmin
              ? "No contributor uploads match the active filter criteria."
              : "You haven't uploaded or recorded any speech samples yet. Head to Collect Data to contribute your first utterance."
          }
          actionText="Collect & Record Audio"
          onAction={onNavigateToCollect}
        />
      </div>
    );
  }

  const totalPages = Math.ceil(records.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentRecords = records.slice(startIndex, startIndex + pageSize);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>ID</th>
              <th style={{ width: isAdmin ? '24%' : '28%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={14} /> Transcript
                </span>
              </th>
              {isAdmin && (
                <th style={{ width: '16%' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={14} /> Contributor
                  </span>
                </th>
              )}
              {isAdmin && (
                <th style={{ width: '10%' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <FileAudio size={14} /> Type
                  </span>
                </th>
              )}
              <th style={{ width: isAdmin ? '14%' : '18%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} /> Upload Time
                </span>
              </th>
              <th style={{ width: isAdmin ? '18%' : '24%' }}>Audio Preview</th>
              <th style={{ width: isAdmin ? '12%' : '14%', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record) => (
              <DatasetRow
                key={record.id}
                record={record}
                onDeleteRecord={onDeleteRecord}
                onUpdateRecord={onUpdateRecord}
                isAdmin={isAdmin}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <span>
            Showing <strong>{startIndex + 1}</strong> -{' '}
            <strong>{Math.min(startIndex + pageSize, records.length)}</strong> of{' '}
            <strong>{records.length}</strong> records
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
