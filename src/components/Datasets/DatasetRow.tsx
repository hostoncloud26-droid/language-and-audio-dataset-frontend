import React, { useState } from 'react';
import { DatasetRecord } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { formatDuration } from '../../services/audioService';
import {
  Play,
  Pause,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Download,
  Trash2,
  Pencil,
  X,
  Cloud,
  FileAudio,
  Sparkles,
} from 'lucide-react';

interface DatasetRowProps {
  record: DatasetRecord;
  onDeleteRecord?: (recordId: string) => void;
  onUpdateRecord?: (recordId: string, newText: string) => Promise<void>;
}

export const DatasetRow: React.FC<DatasetRowProps> = ({ record, onDeleteRecord, onUpdateRecord }) => {
  const { currentTrackId, isPlaying, currentTime, duration, isLoading, toggleAudio, seekTo } = useAudioPlayer();
  const [copied, setCopied] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

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

  // Detect file type / format
  const getFileType = (url?: string): string => {
    if (!url) return 'WAV';
    const clean = url.split('?')[0].split('#')[0];
    const ext = clean.split('.').pop()?.toUpperCase();
    if (ext && ['WAV', 'MP3', 'OGG', 'M4A', 'AAC', 'WEBM', 'FLAC'].includes(ext)) {
      return ext;
    }
    return 'WAV';
  };

  const fileType = getFileType(record.audio_url);

  // Format upload time / date
  const formatUploadDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: 'Recently', time: '—' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: '' };

      const datePart = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return { date: datePart, time: timePart };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  const uploadTime = formatUploadDateTime(record.created_at);

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

  const handleDownload = async () => {
    if (!record.audio_url) return;
    setIsDownloading(true);
    const filename = `${record.id}_${(record.language_name || 'audio').toLowerCase()}.${fileType.toLowerCase()}`;

    try {
      // Try direct blob fetch for cross-origin or local files
      const response = await fetch(record.audio_url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        setIsDownloading(false);
        return;
      }
    } catch {
      // Fallback to direct anchor download
    }

    const a = document.createElement('a');
    a.href = record.audio_url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsDownloading(false);
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
      {/* 1. ID Column */}
      <td className="table-id-cell" style={{ whiteSpace: 'nowrap' }}>
        <span>{record.id}</span>
      </td>

      {/* 2. Text / Transcript Column with Inline Edit & Copy */}
      <td style={{ maxWidth: '340px' }}>
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
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, fontSize: '0.88rem' }}>
              {record.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {record.language_name && (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {record.language_name}
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

      {/* 3. Type Column (Audio Format & Storage Source) */}
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0369a1',
              background: '#e0f2fe',
              padding: '2px 8px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
            }}
          >
            <FileAudio size={12} />
            {fileType}
          </span>
          {isServerAudio ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#0d9488',
                background: '#ccfbf1',
                padding: '1px 6px',
                borderRadius: '4px',
              }}
              title="Stored remotely in Chibisafe cloud storage"
            >
              <Cloud size={10} /> Cloud
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#6366f1',
                background: '#eef2ff',
                padding: '1px 6px',
                borderRadius: '4px',
              }}
              title="Synthesized audio sample"
            >
              <Sparkles size={10} /> Synth
            </span>
          )}
        </div>
      </td>

      {/* 4. Upload Time Column */}
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {uploadTime.date}
          </span>
          {uploadTime.time && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {uploadTime.time}
            </span>
          )}
        </div>
      </td>

      {/* 5. Audio Column with Scrubber and Player */}
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

      {/* 6. Download Button & Actions Column */}
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {/* Prominent Direct Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn-download-action"
            title={`Download ${record.id} (${fileType})`}
          >
            {isDownloading ? (
              <Loader2 size={13} className="spin-icon" />
            ) : (
              <Download size={13} />
            )}
            <span>Download</span>
          </button>

          {onUpdateRecord && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditText(record.text);
                setIsEditing(true);
              }}
              className="btn-icon-subtle"
              title="Edit transcript"
            >
              <Pencil size={14} />
            </button>
          )}

          <a
            href={record.audio_url}
            target="_blank"
            rel="noreferrer"
            className="btn-icon-subtle"
            title="Open direct audio URL"
          >
            <ExternalLink size={14} />
          </a>

          {onDeleteRecord && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn-icon-subtle danger"
              title="Delete Record"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
