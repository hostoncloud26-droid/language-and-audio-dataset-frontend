import React, { useState, useEffect } from 'react';
import { Dataset, DatasetRecord, Language, ContributorSummary } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { exportDatasetAsZip } from '../services/zipExportService';
import { DatasetControls } from '../components/Datasets/DatasetControls';
import { DatasetTable } from '../components/Datasets/DatasetTable';
import {
  Layers,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  User as UserIcon,
  Users,
  Mic,
  Clock,
  Database,
  FileSpreadsheet,
  ExternalLink,
} from 'lucide-react';

interface DatasetsPageProps {
  onNavigateToCollect: () => void;
}

export const DatasetsPage: React.FC<DatasetsPageProps> = ({ onNavigateToCollect }) => {
  const { user, isAdmin } = useAuth();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [records, setRecords] = useState<DatasetRecord[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [contributors, setContributors] = useState<ContributorSummary[]>([]);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('');
  const [selectedContributorId, setSelectedContributorId] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Contributor Directory Modal (Administrator only)
  const [isContributorsModalOpen, setIsContributorsModalOpen] = useState<boolean>(false);

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
      const promises: [Promise<Dataset[]>, Promise<Language[]>, Promise<DatasetRecord[]>] = [
        api.getDatasets(),
        api.getLanguages(),
        api.getDatasetRecords(
          selectedDatasetId || undefined,
          selectedLanguageId || undefined,
          isAdmin ? (selectedContributorId || undefined) : undefined
        ),
      ];

      const [fetchedDatasets, fetchedLanguages, fetchedRecords] = await Promise.all(promises);

      setDatasets(fetchedDatasets);
      setLanguages(fetchedLanguages);
      setRecords(fetchedRecords);

      if (fetchedLanguages.length > 0 && !newDsLanguageId) {
        setNewDsLanguageId(String(fetchedLanguages[0].id));
      }

      // If Administrator, fetch contributor directory
      if (isAdmin) {
        const fetchedContribs = await api.getAdminContributors();
        setContributors(fetchedContribs);
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
  }, [selectedDatasetId, selectedLanguageId, selectedContributorId]);

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
      rec.id.toLowerCase().includes(searchText.toLowerCase()) ||
      (rec.uploaded_by && rec.uploaded_by.toLowerCase().includes(searchText.toLowerCase()));

    const matchesDataset =
      !selectedDatasetId || rec.dataset_id === selectedDatasetId;

    const matchesLanguage =
      !selectedLanguageId || String(rec.language_id) === String(selectedLanguageId);

    const matchesContributor =
      !isAdmin || !selectedContributorId || rec.user_id === selectedContributorId;

    return matchesSearch && matchesDataset && matchesLanguage && matchesContributor;
  });

  const totalDurationSecs = filteredRecords.reduce((acc, r) => {
    const dur = typeof r.duration === 'number' ? r.duration : parseFloat(String(r.duration || 0));
    return acc + (isNaN(dur) ? 0 : dur);
  }, 0);

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
        datasetName: currentDataset?.name || (isAdmin ? 'Global Speech Corpus' : 'My Speech Recordings'),
        languageFilter: currentLang?.name || 'All Languages',
        onProgress: (_completed, _total, message) => {
          setExportProgressText(message);
        },
      });

      showToast(`✅ Exported "${result.filename}" with ${result.totalAudioFiles} audio files & annotations.`);
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
      {/* Toast notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Context Banner */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {isAdmin ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    background: '#e2e8f0',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <ShieldCheck size={13} color="#0284c7" />
                  Administrator Supervisory View
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    background: 'var(--primary-subtle)',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <UserIcon size={13} />
                  Contributor Private Workspace
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isAdmin ? 'Global Datasets & All Contributor Uploads' : 'My Uploaded Audio Recordings'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isAdmin
                ? 'Supervisory oversight: Inspect every recording uploaded by every contributor across the entire platform.'
                : `Showing only recordings uploaded by your account (${user?.name || user?.username}). Other contributors cannot see your data.`}
            </p>
          </div>

          {/* Quick Action Buttons for Administrator */}
          {isAdmin && contributors.length > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsContributorsModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px' }}
            >
              <Users size={15} color="var(--primary)" />
              <span>Contributor Directory ({contributors.length})</span>
            </button>
          )}
        </div>

        {/* Professional Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isAdmin ? 'Total Utterances' : 'My Uploaded Audio'}
              </span>
              <Mic size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {filteredRecords.length}{' '}
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>recordings</span>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isAdmin ? 'Total Audio Duration' : 'My Total Duration'}
              </span>
              <Clock size={16} color="#0d9488" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {Math.floor(totalDurationSecs / 60)}m {Math.round(totalDurationSecs % 60)}s
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {isAdmin ? 'Active Contributors' : 'Workspace Privacy'}
              </span>
              {isAdmin ? <Users size={16} color="#8b5cf6" /> : <ShieldCheck size={16} color="#10b981" />}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isAdmin ? (
                `${contributors.length} contributors`
              ) : (
                <span style={{ color: '#059669', fontSize: '0.95rem' }}>Strictly Isolated</span>
              )}
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Datasets
              </span>
              <Database size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {datasets.length}{' '}
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>corpora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Filter & Search Controls */}
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
        onOpenCreateModal={
          isAdmin
            ? () => {
                setIsModalOpen(true);
                setModalError(null);
              }
            : undefined
        }
        onExportData={handleExportData}
        isExporting={isExporting}
        exportProgressText={exportProgressText}
        isAdmin={isAdmin}
        contributors={contributors}
        selectedContributorId={selectedContributorId}
        onSelectContributor={setSelectedContributorId}
      />

      {/* Records Table */}
      <DatasetTable
        records={filteredRecords}
        isLoading={isLoading}
        error={error}
        onRetry={() => loadData(false)}
        onNavigateToCollect={onNavigateToCollect}
        onDeleteRecord={handleDeleteRecord}
        onUpdateRecord={handleUpdateRecord}
        pageSize={6}
        isAdmin={isAdmin}
      />

      {/* Administrator Contributor Directory Modal */}
      {isContributorsModalOpen && isAdmin && (
        <div className="modal-overlay" onClick={() => setIsContributorsModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Users size={18} color="var(--primary)" />
                <span>Contributor Directory & Submissions Overview</span>
              </h3>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={() => setIsContributorsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                All registered contributors and the volume of speech recordings contributed to the platform:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                {contributors.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: c.role === 'Administrator' ? '#0f172a' : 'var(--primary-subtle)',
                          color: c.role === 'Administrator' ? '#ffffff' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}
                      >
                        {(c.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {c.name || c.username}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {c.username} • {c.role}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {c.upload_count}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>
                          uploads ({c.total_duration}s)
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedContributorId(c.id);
                          setIsContributorsModalOpen(false);
                        }}
                        style={{ padding: '4px 10px', fontSize: '0.76rem', height: '30px' }}
                      >
                        View Uploads
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-page"
                onClick={() => setIsContributorsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Dataset Modal (Administrator only) */}
      {isModalOpen && isAdmin && (
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
                    placeholder="e.g. Conversational Speech Corpus 2026"
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
                    style={{ width: '100%', height: '42px' }}
                    value={newDsLanguageId}
                    onChange={(e) => setNewDsLanguageId(e.target.value)}
                    disabled={isCreating}
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={String(l.id)}>
                        {l.name} {l.code ? `(${l.code.toUpperCase()})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ds-desc">
                    Corpus Description
                  </label>
                  <textarea
                    id="ds-desc"
                    className="textarea-custom"
                    placeholder="Description of acoustic domain, speaker demographics, or recording parameters..."
                    value={newDsDesc}
                    onChange={(e) => setNewDsDesc(e.target.value)}
                    disabled={isCreating}
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-page"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreating || !newDsName.trim()}
                  style={{ minWidth: '130px', height: '40px' }}
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
    </div>
  );
};
