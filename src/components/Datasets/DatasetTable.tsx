import React, { useState } from 'react';
import { DatasetRecord } from '../../types';
import { DatasetRow } from './DatasetRow';
import { TableSkeleton } from '../common/TableSkeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBanner } from '../common/ErrorBanner';
import { Mic } from 'lucide-react';

interface DatasetTableProps {
  records: DatasetRecord[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigateToCollect: () => void;
  onDeleteRecord?: (recordId: string) => void;
  onUpdateRecord?: (recordId: string, newText: string) => Promise<void>;
  pageSize?: number;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({
  records,
  isLoading,
  error,
  onRetry,
  onNavigateToCollect,
  onDeleteRecord,
  onUpdateRecord,
  pageSize = 5,
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

  if (records.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<Mic size={32} />}
          title="No audio data available."
          description="Start collecting audio data to populate this dataset."
          actionText="Collect Data"
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
              <th style={{ width: '15%' }}>ID</th>
              <th style={{ width: '45%' }}>Text</th>
              <th style={{ width: '30%' }}>Audio</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record) => (
              <DatasetRow
                key={record.id}
                record={record}
                onDeleteRecord={onDeleteRecord}
                onUpdateRecord={onUpdateRecord}
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
