import React, { useState, useEffect, useMemo } from 'react';
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

  // Selected contributor details (when admin filters by member)
  const selectedMember = useMemo(() => {
    if (!selectedContributorId) return null;
    return (
      contributors.find(
        (c) =>
          String(c.id).toLowerCase() === selectedContributorId.toLowerCase() ||
          c.username.toLowerCase() === selectedContributorId.toLowerCase() ||
          c.name.toLowerCase() === selectedContributorId.toLowerCase()
      ) || null
    );
  }, [contributors, selectedContributorId]);

  // Dynamic aggregation of each member's contribution time and upload count
  const memberContributionList = useMemo<ContributorSummary[]>(() => {
    const map = new Map<string, ContributorSummary>();

    // Seed from contributors list
    contributors.forEach((c) => {
      const key = String(c.id);
      map.set(key, {
        id: key,
        name: c.name || c.username,
        username: c.username || c.name,
        role: c.role || 'Contributor',
        total_duration: typeof c.total_duration === 'number' ? c.total_duration : 0,
        upload_count: typeof c.upload_count === 'number' ? c.upload_count : 0,
      });
    });

    // Also calculate real-time stats from records
    records.forEach((r) => {
      const uid = r.user_id ? String(r.user_id) : '';
      const uname = r.uploaded_by || 'Unknown';
      let foundKey: string | null = null;
      if (uid && map.has(uid)) {
        foundKey = uid;
      } else {
        for (const [k, v] of map.entries()) {
          if (v.name.toLowerCase() === uname.toLowerCase() || v.username.toLowerCase() === uname.toLowerCase()) {
            foundKey = k;
            break;
          }
        }
      }

      if (!foundKey && (uid || uname)) {
        const newKey = uid || uname;
        map.set(newKey, {
          id: newKey,
          name: uname,
          username: uname.toLowerCase().replace(/\s+/g, '_'),
          role: 'Contributor',
          total_duration: 0,
          upload_count: 0,
        });
      }
    });

    // Compute exact durations from current records for consistency
    return Array.from(map.values()).map((member) => {
      const memberRecs = records.filter(
        (r) =>
          (r.user_id && String(r.user_id) === member.id) ||
          (r.uploaded_by && r.uploaded_by.toLowerCase() === member.name.toLowerCase()) ||
          (r.uploaded_by && r.uploaded_by.toLowerCase() === member.username.toLowerCase())
      );
      if (memberRecs.length > 0) {
        const durationSum = memberRecs.reduce((acc, r) => {
          const d = typeof r.duration === 'number' ? r.duration : parseFloat(String(r.duration || 0)) || 0;
          return acc + d;
        }, 0);
        return {
          ...member,
          upload_count: memberRecs.length,
          total_duration: durationSum > 0 ? durationSum : member.total_duration,
        };
      }
      return member;
    });
  }, [contributors, records]);

  // Overall platform total duration
  const platformTotalDurationSecs = useMemo(() => {
    return records.reduce((acc, r) => {
      const dur = typeof r.duration === 'number' ? r.duration : parseFloat(String(r.duration || 0));
      return acc + (isNaN(dur) ? 0 : dur);
    }, 0);
  }, [records]);

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
      !isAdmin ||
      !selectedContributorId ||
      rec.user_id === selectedContributorId ||
      (rec.uploaded_by && rec.uploaded_by.toLowerCase() === selectedContributorId.toLowerCase()) ||
      (selectedMember && (
        rec.user_id === selectedMember.id ||
        (rec.uploaded_by && rec.uploaded_by.toLowerCase() === selectedMember.name.toLowerCase()) ||
        (rec.uploaded_by && rec.uploaded_by.toLowerCase() === selectedMember.username.toLowerCase())
      ));

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
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {isAdmin ? 'All Audio Recordings' : 'My Uploaded Audio Recordings'}
            </h2>
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

        {/* Professional Metrics Strip with Member Contribution Time Option */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isAdmin ? 'repeat(auto-fit, minmax(240px, 1fr))' : 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {/* Card 1: Audio Recordings */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isAdmin
                  ? selectedMember
                    ? `${selectedMember.name} Recordings`
                    : 'Total Audio Recordings'
                  : 'My Uploaded Audio'}
              </span>
              <Mic size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {filteredRecords.length}{' '}
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>recordings</span>
            </div>
            {isAdmin && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedMember ? `Filtered to ${selectedMember.name}` : `Total across all members`}
              </div>
            )}
          </div>

          {/* Card 2: Audio Duration / Contributed Time */}
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '16px 20px',
              borderRadius: '12px',
              border: selectedMember ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
              boxShadow: selectedMember ? '0 0 12px rgba(16, 185, 129, 0.12)' : 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: selectedMember ? '#34d399' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isAdmin
                  ? selectedMember
                    ? `${selectedMember.name} Contribution Time`
                    : 'Total Audio Duration'
                  : 'My Total Duration'}
              </span>
              <Clock size={16} color={selectedMember ? '#10b981' : '#0d9488'} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {Math.floor(totalDurationSecs / 60)}m {Math.round(totalDurationSecs % 60)}s
            </div>
            {isAdmin && (
              <div style={{ fontSize: '0.75rem', color: selectedMember ? '#10b981' : 'var(--text-muted)', marginTop: '4px', fontWeight: selectedMember ? 600 : 400 }}>
                {selectedMember ? `✓ ${selectedMember.name}'s contributed time` : `Cumulative platform audio duration`}
              </div>
            )}
          </div>

          {/* Card 3: Member Contribution Time Selector (Admin Only) */}
          {isAdmin && (
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '16px 20px',
                borderRadius: '12px',
                border: selectedContributorId ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-subtle)',
                boxShadow: selectedContributorId ? '0 0 15px rgba(139, 92, 246, 0.14)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} color="#a855f7" />
                    Member Contribution Time
                  </span>
                  {selectedContributorId && (
                    <button
                      type="button"
                      onClick={() => setSelectedContributorId('')}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="Clear selection and view all members"
                    >
                      <X size={11} /> Reset
                    </button>
                  )}
                </div>

                <select
                  value={selectedContributorId}
                  onChange={(e) => setSelectedContributorId(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    background: '#121217',
                    border: '1px solid #28283a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0 10px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  title="Select person to view their contribution time"
                >
                  <option value="">
                    All Members ({Math.floor(platformTotalDurationSecs / 60)}m {Math.round(platformTotalDurationSecs % 60)}s total)
                  </option>
                  {memberContributionList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {Math.floor(m.total_duration / 60)}m {Math.round(m.total_duration % 60)}s ({m.upload_count} recs)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: selectedContributorId ? '#a78bfa' : 'var(--text-muted)' }}>
                {selectedMember ? (
                  <span>
                    Viewing <strong>{selectedMember.name}</strong> ({Math.floor(totalDurationSecs / 60)}m {Math.round(totalDurationSecs % 60)}s)
                  </span>
                ) : (
                  <span>Select any person above to view their contribution time only</span>
                )}
              </div>
            </div>
          )}
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
        onExportData={handleExportData}
        isExporting={isExporting}
        exportProgressText={exportProgressText}
        isAdmin={isAdmin}
        contributors={memberContributionList}
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
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
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
