import React, { useState, useEffect } from 'react';
import { Dataset, DatasetRecord, Language } from '../types';
import { api } from '../services/api';
import { exportDatasetAsZip } from '../services/zipExportService';
import { DatasetControls } from '../components/Datasets/DatasetControls';
import { DatasetTable } from '../components/Datasets/DatasetTable';
import { Layers, X, Plus, Loader2, CheckCircle2 } from 'lucide-react';

interface DatasetsPageProps {
  onNavigateToCollect: () => void;
}

export const DatasetsPage: React.FC<DatasetsPageProps> = ({ onNavigateToCollect }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [records, setRecords] = useState<DatasetRecord[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New Dataset Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newDsName, setNewDsName] = useState<string>('');
  const [newDsLanguageId, setNewDsLanguageId] = useState<string>('');
  const [newDsDesc, setNewDsDesc] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ZIP Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgressText, setExportProgressText] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [fetchedDatasets, fetchedLanguages, fetchedRecords] = await Promise.all([
        api.getDatasets(),
        api.getLanguages(),
        api.getDatasetRecords(selectedDatasetId || undefined, selectedLanguageId || undefined),
      ]);

      setDatasets(fetchedDatasets);
      setLanguages(fetchedLanguages);
      setRecords(fetchedRecords);

      if (fetchedLanguages.length > 0 && !newDsLanguageId) {
        setNewDsLanguageId(String(fetchedLanguages[0].id));
      }
    } catch {
      setError('Unable to load dataset records from backend.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDatasetId, selectedLanguageId]);

  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDsName.trim()) {
      setModalError('Please enter a dataset name.');
      return;
    }
    const langId = newDsLanguageId || (languages[0]?.id ? String(languages[0].id) : '1');

    setIsCreating(true);
    setModalError(null);

    try {
      const created = await api.createDataset(newDsName.trim(), langId, newDsDesc.trim());
      setIsModalOpen(false);
      setNewDsName('');
      setNewDsDesc('');
      showToast(`Dataset "${created.name}" created successfully!`);
      await loadData();
      setSelectedDatasetId(created.id);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create dataset');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await api.deleteRecord(recordId, selectedDatasetId || undefined);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      showToast(`Recording ${recordId} deleted from server.`);
      loadData(false);
    } catch (err: any) {
      alert(`Could not delete record: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUpdateRecord = async (recordId: string, newText: string) => {
    try {
      const updated = await api.updateRecord(recordId, newText);
      setRecords((prev) => prev.map((r) => (r.id === recordId ? updated : r)));
      showToast(`Record ${recordId} updated on server.`);
    } catch (err: any) {
      alert(`Could not update record: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };


  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      !searchText ||
      rec.text.toLowerCase().includes(searchText.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchText.toLowerCase());

    const matchesDataset =
      !selectedDatasetId || rec.dataset_id === selectedDatasetId;

    const matchesLanguage =
      !selectedLanguageId || String(rec.language_id) === String(selectedLanguageId);

    return matchesSearch && matchesDataset && matchesLanguage;
  });

  const handleExportData = async () => {
    if (filteredRecords.length === 0) {
      showToast('No records match your filters to export.');
      return;
    }

    setIsExporting(true);
    setExportProgressText('Preparing ZIP...');
    showToast(`Starting ZIP export for ${filteredRecords.length} audio recordings...`);

    const currentDataset = datasets.find((d) => d.id === selectedDatasetId);
    const currentLang = languages.find((l) => String(l.id) === String(selectedLanguageId));

    try {
      const result = await exportDatasetAsZip(filteredRecords, {
        datasetId: selectedDatasetId || 'all_datasets',
        datasetName: currentDataset?.name || 'All Audio Recordings',
        languageFilter: currentLang?.name || 'All Languages',
        onProgress: (_completed, _total, message) => {
          setExportProgressText(message);
        },
      });

      showToast(`✅ Exported "${result.filename}" with ${result.totalAudioFiles} audio files & metadata.`);
    } catch (err: any) {
      console.error('Failed to export dataset zip:', err);
      showToast(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Datasets
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Collected audio recordings, synthesized samples, and speech transcripts in table view
        </p>
      </div>

      <DatasetControls
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={setSelectedDatasetId}
        languages={languages}
        selectedLanguageId={selectedLanguageId}
        onSelectLanguage={setSelectedLanguageId}
        searchText={searchText}
        onSearchChange={setSearchText}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        onOpenCreateModal={() => {
          setIsModalOpen(true);
          setModalError(null);
        }}
        onExportData={handleExportData}
        isExporting={isExporting}
        exportProgressText={exportProgressText}
      />

      <DatasetTable
        records={filteredRecords}
        isLoading={isLoading}
        error={error}
        onRetry={() => loadData(false)}
        onNavigateToCollect={onNavigateToCollect}
        onDeleteRecord={handleDeleteRecord}
        onUpdateRecord={handleUpdateRecord}
        pageSize={6}
      />

      {/* Create Dataset Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isCreating && setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Layers size={18} color="var(--primary)" />
                <span>Create New Speech Dataset</span>
              </h3>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDataset}>
              <div className="modal-body">
                {modalError && (
                  <div className="error-alert" style={{ marginBottom: '16px' }}>
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="ds-name">
                    Dataset Name *
                  </label>
                  <input
                    id="ds-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Conversational Dialects 2026"
                    value={newDsName}
                    onChange={(e) => setNewDsName(e.target.value)}
                    disabled={isCreating}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ds-lang">
                    Primary Language *
                  </label>
                  <select
                    id="ds-lang"
                    className="dataset-select"
                    style={{ width: '100%', height: '44px' }}
                    value={newDsLanguageId}
                    onChange={(e) => setNewDsLanguageId(e.target.value)}
                    disabled={isCreating}
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={String(l.id)}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="ds-desc">
                    Description (Optional)
                  </label>
                  <textarea
                    id="ds-desc"
                    className="textarea-custom"
                    style={{ minHeight: '80px', marginBottom: 0 }}
                    placeholder="Brief description of acoustic domain or speaker demographics..."
                    value={newDsDesc}
                    onChange={(e) => setNewDsDesc(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0 20px', height: '40px' }}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Dataset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-box success">
            <CheckCircle2 size={18} color="#a7f3d0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
