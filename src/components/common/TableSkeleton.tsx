import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div style={{ padding: '16px' }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="skeleton skeleton-row" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '0 12px' }}>
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div 
              key={cIdx} 
              style={{ 
                flex: cIdx === 1 ? 2 : 1, 
                height: '18px', 
                background: '#e2e8f0', 
                borderRadius: '4px' 
              }} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};
