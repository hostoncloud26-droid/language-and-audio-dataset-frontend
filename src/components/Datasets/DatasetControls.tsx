import React from 'react';
import { Dataset, Language } from '../../types';
import { Search, RefreshCw, Filter, Layers, Plus, Download } from 'lucide-react';

interface DatasetControlsProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (datasetId: string) => void;
  languages: Language[];
  selectedLanguageId: string;
  onSelectLanguage: (langId: string) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenCreateModal?: () => void;
  onExportData?: () => void;
}

export const DatasetControls: React.FC<DatasetControlsProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  languages,
  selectedLanguageId,
  onSelectLanguage,
  searchText,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onOpenCreateModal,
  onExportData,
}) => {
  return (
    <div className="dataset-top-controls">
      <div className="dataset-controls-left">
        {/* Dataset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--primary)" />
          <select
            className="dataset-select"
            value={selectedDatasetId}
            onChange={(e) => onSelectDataset(e.target.value)}
          >
            <option value="">All Datasets ({datasets.length})</option>
            {datasets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name} ({ds.record_count || 0} samples)
              </option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select
            className="dataset-select"
            value={selectedLanguageId}
            onChange={(e) => onSelectLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.id} value={String(lang.id)}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search text input */}
        <div className="search-input-box" style={{ minWidth: '220px', maxWidth: '320px' }}>
          <Search size={16} className="input-icon-left" />
          <input
            type="text"
            placeholder="Search audio transcripts..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ height: '40px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onExportData && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onExportData}
            title="Export filtered records as JSON"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
        )}

        <button
          type="button"
          className="btn-secondary"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh dataset from PostgreSQL backend"
        >
          <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>

        {onOpenCreateModal && (
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenCreateModal}
            style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}
            title="Create a new dataset in PostgreSQL"
          >
            <Plus size={16} />
            <span>New Dataset</span>
          </button>
        )}
      </div>
    </div>
  );
};
