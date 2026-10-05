import React, { useState } from 'react';
import { DatasetRecord } from '../../types';
import { DatasetRow } from './DatasetRow';
import { TableSkeleton } from '../common/TableSkeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBanner } from '../common/ErrorBanner';
import { Mic, Clock, FileAudio, Download, FileText } from 'lucide-react';

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
  pageSize = 6,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (isLoading) {
    return (
      <div className="card">
        <TableSkeleton rows={pageSize} columns={6} />
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
              <th style={{ width: '12%' }}>ID</th>
              <th style={{ width: '28%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={14} /> Transcript
                </span>
              </th>
              <th style={{ width: '11%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <FileAudio size={14} /> Type
                </span>
              </th>
              <th style={{ width: '16%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} /> Upload Time
                </span>
              </th>
              <th style={{ width: '18%' }}>Audio Preview</th>
              <th style={{ width: '15%', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Download size={14} /> Download & Actions
                </span>
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
