import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { api } from '../services/api';
import { LanguageSearch } from '../components/Languages/LanguageSearch';
import { LanguageTable } from '../components/Languages/LanguageTable';
import { Globe, RefreshCw, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';

export const LanguagesPage: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add Language Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newLangName, setNewLangName] = useState<string>('');
  const [newLangCode, setNewLangCode] = useState<string>('');
  const [newLangStatus, setNewLangStatus] = useState<string>('Active');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchLanguages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getLanguages();
      setLanguages(data);
    } catch {
      setError('Unable to load languages from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newLangName.trim();
    if (!cleanName) {
      setModalError('Language name is required.');
      return;
    }

    setIsSaving(true);
    setModalError(null);

    try {
      const created = await api.createLanguage(cleanName, newLangCode.trim() || undefined, newLangStatus);
      setIsModalOpen(false);
      setNewLangName('');
      setNewLangCode('');
      setNewLangStatus('Active');
      showToast(`Language "${created.name}" added successfully.`);
      await fetchLanguages();
    } catch (err: any) {
      setModalError(err.message || 'Failed to add language');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (langId: string | number, currentStatus: string) => {
    const nextStatus = currentStatus.toLowerCase() === 'active' ? 'Inactive' : 'Active';
    try {
      await api.updateLanguage(langId, { status: nextStatus });
      setLanguages((prev) =>
        prev.map((l) => (String(l.id) === String(langId) ? { ...l, status: nextStatus } : l))
      );
      showToast(`Language status changed to ${nextStatus}.`);
    } catch (err: any) {
      alert(`Could not toggle status: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteLanguage = async (langId: string | number, langName: string) => {
    try {
      await api.deleteLanguage(langId);
      setLanguages((prev) => prev.filter((l) => String(l.id) !== String(langId)));
      showToast(`Language "${langName}" deleted.`);
    } catch (err: any) {
      alert(`Could not delete language: ${err.message || 'Unknown error'}`);
    }
  };

  const filteredLanguages = languages.filter((lang) => {
    const q = searchTerm.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      (lang.code && lang.code.toLowerCase().includes(q)) ||
      String(lang.id).includes(q)
    );
  });

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Projects
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Projects and language tracks configured for audio dataset collection ({languages.length} total)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={fetchLanguages}
            disabled={isLoading}
            title="Reload projects from backend"
          >
            <RefreshCw size={15} className={isLoading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              setIsModalOpen(true);
              setModalError(null);
            }}
            style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}
            title="Add a new project to the platform"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      <LanguageSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <LanguageTable
        languages={filteredLanguages}
        isLoading={isLoading}
        error={error}
        onRetry={fetchLanguages}
        onToggleStatus={handleToggleStatus}
        onDeleteLanguage={handleDeleteLanguage}
        pageSize={6}
      />

      {/* Add Language Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSaving && setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Globe size={18} color="var(--primary)" />
                <span>Add New Project / Language</span>
              </h3>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLanguage}>
              <div className="modal-body">
                {modalError && (
                  <div className="error-alert" style={{ marginBottom: '16px' }}>
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="lang-name">
                    Project / Language Name *
                  </label>
                  <input
                    id="lang-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kannada Speech Track, French Dataset"
                    value={newLangName}
                    onChange={(e) => setNewLangName(e.target.value)}
                    disabled={isSaving}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lang-code">
                    ISO Code (Optional)
                  </label>
                  <input
                    id="lang-code"
                    type="text"
                    className="form-input"
                    placeholder="e.g. kn, fr, de"
                    maxLength={6}
                    value={newLangCode}
                    onChange={(e) => setNewLangCode(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="lang-status">
                    Initial Status
                  </label>
                  <select
                    id="lang-status"
                    className="dataset-select"
                    style={{ width: '100%', height: '44px' }}
                    value={newLangStatus}
                    onChange={(e) => setNewLangStatus(e.target.value)}
                    disabled={isSaving}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0 20px', height: '40px' }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Add Language</span>
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
