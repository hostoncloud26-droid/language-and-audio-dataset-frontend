import React from 'react';
import { Dataset, Language, ContributorSummary } from '../../types';
import { Search, RefreshCw, Filter, Layers, Plus, Download, Loader2, Users } from 'lucide-react';

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
  isExporting?: boolean;
  exportProgressText?: string;
  isAdmin?: boolean;
  contributors?: ContributorSummary[];
  selectedContributorId?: string;
  onSelectContributor?: (contribId: string) => void;
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
  isExporting = false,
  exportProgressText = '',
  isAdmin = false,
  contributors = [],
  selectedContributorId = '',
  onSelectContributor,
}) => {
  return (
    <div className="dataset-top-controls">
      <div className="dataset-controls-left" style={{ flexWrap: 'wrap', gap: '10px' }}>
        {/* Administrator-only Contributor Filter */}
        {isAdmin && onSelectContributor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--primary)" />
            <select
              className="dataset-select"
              value={selectedContributorId}
              onChange={(e) => onSelectContributor(e.target.value)}
              style={{
                borderColor: selectedContributorId ? 'var(--primary)' : undefined,
                background: selectedContributorId ? '#f0f9ff' : undefined,
                fontWeight: 600,
              }}
              title="Filter uploads by contributor"
            >
              <option value="">All Contributors (Global View)</option>
              {contributors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.username} ({c.upload_count} uploads)
                </option>
              ))}
            </select>
          </div>
        )}

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
        <div className="search-input-box" style={{ minWidth: '220px', maxWidth: '300px' }}>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {onExportData && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onExportData}
            disabled={isExporting}
            title={isAdmin ? 'Export all recordings as a ZIP archive' : 'Export your personal recordings as a ZIP archive'}
            style={{ minWidth: isExporting ? '140px' : 'auto' }}
          >
            {isExporting ? (
              <>
                <Loader2 size={15} className="spin-icon" />
                <span>{exportProgressText || 'Exporting ZIP...'}</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Export ZIP</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          className="btn-secondary"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh dataset from backend"
        >
          <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>

        {isAdmin && onOpenCreateModal && (
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenCreateModal}
            style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}
            title="Create a new dataset"
          >
            <Plus size={16} />
            <span>New Dataset</span>
          </button>
        )}
      </div>
    </div>
  );
};
