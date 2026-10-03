import React, { useState } from 'react';
import { DatasetRecord } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { formatDuration } from '../../services/audioService';
import { Play, Pause, Loader2, ExternalLink, Copy, Check, Download, Trash2, Pencil, X, Cloud } from 'lucide-react';

interface DatasetRowProps {
  record: DatasetRecord;
  onDeleteRecord?: (recordId: string) => void;
  onUpdateRecord?: (recordId: string, newText: string) => Promise<void>;
}

export const DatasetRow: React.FC<DatasetRowProps> = ({ record, onDeleteRecord, onUpdateRecord }) => {
  const { currentTrackId, isPlaying, currentTime, duration, isLoading, toggleAudio, seekTo } = useAudioPlayer();
  const [copied, setCopied] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(record.text);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isThisActive = currentTrackId === record.id;
  const isThisPlaying = isThisActive && isPlaying;
  const isThisLoading = isThisActive && isLoading;

  const currentProgress = isThisActive && duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayedDuration = isThisActive && duration > 0 ? duration : (typeof record.duration === 'number' ? record.duration : 0);

  const isServerAudio = record.audio_url && (record.audio_url.includes('chibisafe') || record.audio_url.includes('/api/file/'));

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isThisActive) {
      toggleAudio(record.id, record.audio_url, typeof record.duration === 'number' ? record.duration : undefined);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    seekTo(percent);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(record.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = record.audio_url;
    a.download = `${record.id}_${(record.language_name || 'sample').toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete recording ${record.id}? This will also delete the audio file from the remote server.`)) {
      setIsDeleting(true);
      if (onDeleteRecord) {
        onDeleteRecord(record.id);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    if (editText.trim() === record.text) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      if (onUpdateRecord) {
        await onUpdateRecord(record.id, editText.trim());
      }
      setIsEditing(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(record.text);
    setIsEditing(false);
  };

  return (
    <tr style={{ opacity: isDeleting ? 0.4 : 1, transition: 'opacity 0.2s' }}>
      {/* ID Column */}
      <td className="table-id-cell" style={{ whiteSpace: 'nowrap' }}>
        <span>{record.id}</span>
      </td>

      {/* Text Column with Inline Edit & Copy */}
      <td style={{ maxWidth: '420px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <textarea
              className="textarea-custom"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              disabled={isSaving}
              style={{
                minHeight: '60px',
                fontSize: '0.88rem',
                padding: '8px 10px',
                resize: 'vertical',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={isSaving || !editText.trim()}
                style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                title="Save changes to server"
              >
                {isSaving ? <Loader2 size={12} className="spin-icon" /> : <Check size={12} />}
                <span>Save</span>
              </button>
              <button
                type="button"
                className="btn-page"
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                title="Cancel editing"
              >
                <X size={12} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {record.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {record.language_name && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {record.language_name}
                </span>
              )}

              {isServerAudio && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#0284c7',
                    background: '#e0f2fe',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                  title="Audio stored in remote Chibisafe cloud server"
                >
                  <Cloud size={10} /> Cloud Server
                </span>
              )}

              <button
                type="button"
                onClick={handleCopyText}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  color: copied ? '#059669' : 'var(--text-muted)',
                  background: copied ? '#ecfdf5' : 'transparent',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: copied ? '1px solid #a7f3d0' : 'none',
                  cursor: 'pointer',
                }}
                title="Copy transcript to clipboard"
              >
                {copied ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </>
        )}
      </td>

      {/* Audio Column with unified Single Active Player */}
      <td>
        <div className="audio-cell">
          <button
            className={`btn-play-mini ${isThisPlaying ? 'playing' : ''}`}
            onClick={() => toggleAudio(record.id, record.audio_url, typeof record.duration === 'number' ? record.duration : undefined)}
            title={isThisPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isThisLoading ? (
              <Loader2 size={16} className="spin-icon" />
            ) : isThisPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} style={{ marginLeft: '2px' }} />
            )}
          </button>

          <div className="audio-cell-track">
            <div className="audio-progress-bg" onClick={handleProgressBarClick}>
              <div
                className="audio-progress-fill"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <div className="audio-meta-text">
              <span>{isThisActive ? formatDuration(currentTime) : '00:00'}</span>
              <span>{formatDuration(displayedDuration)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Actions Column (Edit, Download, Open URL, Delete) */}
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {onUpdateRecord && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditText(record.text);
                setIsEditing(true);
              }}
              className="btn-icon-subtle"
              title="Edit transcript (updates server)"
            >
              <Pencil size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="btn-icon-subtle"
            title="Download Audio File (.wav)"
          >
            <Download size={14} />
          </button>

          <a
            href={record.audio_url}
            target="_blank"
            rel="noreferrer"
            className="btn-icon-subtle"
            title="Open audio link in new tab"
          >
            <ExternalLink size={14} />
          </a>

          {onDeleteRecord && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn-icon-subtle danger"
              title="Delete Record & Remote Server File"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
