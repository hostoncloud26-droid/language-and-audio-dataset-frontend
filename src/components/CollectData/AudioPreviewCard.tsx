import React from 'react';
import { AudioItem } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { formatDuration } from '../../services/audioService';
import { Play, Pause, RotateCcw, Check, Trash2, Sparkles, Upload, FileEdit, CheckCircle2, Send, Loader2, Download, Cloud } from 'lucide-react';


interface AudioPreviewCardProps {
  audioItem: AudioItem;
  finalText: string;
  onFinalTextChange: (text: string) => void;
  isApproved: boolean;
  onApprove: () => void;
  onSubmit: () => void;
  onDiscard: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  isSubmitting: boolean;
}

export const AudioPreviewCard: React.FC<AudioPreviewCardProps> = ({
  audioItem,
  finalText,
  onFinalTextChange,
  isApproved,
  onApprove,
  onSubmit,
  onDiscard,
  onRegenerate,
  isRegenerating,
  isSubmitting,
}) => {
  const {
    currentTrackId,
    isPlaying,
    currentTime,
    duration,
    toggleAudio,
    replayAudio,
    seekTo,
  } = useAudioPlayer();

  const previewId = 'preview-active-track';
  const isThisActive = currentTrackId === previewId;
  const isThisPlaying = isThisActive && isPlaying;

  const currentDuration = isThisActive && duration > 0 ? duration : audioItem.duration;
  const progressPercent = isThisActive && currentDuration > 0 ? (currentTime / currentDuration) * 100 : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isThisActive) {
      toggleAudio(previewId, audioItem.url, audioItem.duration);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    seekTo(clickX / width);
  };

  return (
    <div className="audio-preview-box">
      <div className="audio-preview-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="preview-tag">
            {audioItem.source === 'generated' ? (
              <>
                <Sparkles size={13} /> Generated Speech
              </>
            ) : (
              <>
                <Upload size={13} /> Uploaded Audio
              </>
            )}
          </span>
          {audioItem.url && (audioItem.url.includes('chibisafe') || audioItem.url.includes('/api/file/')) && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
              title="Stored in remote Chibisafe cloud server"
            >
              <Cloud size={11} /> Cloud Server
            </span>
          )}
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {audioItem.filename}
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Duration: {formatDuration(currentDuration)}
        </span>
      </div>

      {/* Main Audio Player Bar */}
      <div className="audio-player-main">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn-play-mini ${isThisPlaying ? 'playing' : ''}`}
            onClick={() => toggleAudio(previewId, audioItem.url, audioItem.duration)}
            title={isThisPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isThisPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            className="btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
            onClick={replayAudio}
            title="Replay from start"
          >
            <RotateCcw size={15} />
          </button>

          <button
            className="btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center' }}
            onClick={() => {
              const a = document.createElement('a');
              a.href = audioItem.url;
              a.download = audioItem.filename || 'preview.wav';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            title="Download preview audio (.wav)"
          >
            <Download size={15} />
          </button>
        </div>

        {/* Audio Progress Track */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="audio-progress-bg" onClick={handleProgressBarClick} style={{ height: '8px' }}>
            <div
              className="audio-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>{isThisActive ? formatDuration(currentTime) : '00:00'}</span>
            <span>{formatDuration(currentDuration)}</span>
          </div>
        </div>

        {/* Animated Waveform Simulation */}
        <div className="waveform-sim" style={{ width: '90px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`wave-bar ${isThisPlaying ? 'active' : ''}`}
              style={{
                animationDelay: `${(i % 5) * 0.15}s`,
                height: isThisPlaying ? `${Math.min(90, 30 + (i * 13) % 65)}%` : '35%',
              }}
            />
          ))}
        </div>
      </div>

      {/* Step 3 & 4: Separate Editable Final Text Box & Regenerate Control */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <label className="form-label" style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 0 }}>
            <FileEdit size={16} color="var(--primary)" />
            <span>Final Text</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* TTS Regenerate Audio */}
            <button
              type="button"
              className="btn-secondary"
              onClick={onRegenerate}
              disabled={!finalText.trim() || isRegenerating || isSubmitting}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                height: '32px',
                padding: '0 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f0f9ff',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                cursor: (!finalText.trim() || isRegenerating || isSubmitting) ? 'not-allowed' : 'pointer'
              }}
              title="Regenerate speech audio using the updated Final Text (TTS)"
            >
              {isRegenerating ? (
                <>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Regenerating (TTS)...</span>
                </>
              ) : (
                <>
                  <RotateCcw size={14} />
                  <span>Regenerate (TTS)</span>
                </>
              )}
            </button>
          </div>
        </div>
        <textarea
          className="textarea-custom"
          placeholder="Edit final text if needed after listening to audio..."
          value={finalText}
          onChange={(e) => onFinalTextChange(e.target.value)}
          disabled={isSubmitting || isRegenerating}
          style={{ minHeight: '90px', marginBottom: 0, background: 'white' }}
        />
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Edit text above and click <strong>Regenerate Audio</strong> to update preview audio before approving.
        </div>
      </div>

      {/* Step 4: Approved Notice Banner */}
      {isApproved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', marginBottom: '20px' }}>
          <CheckCircle2 size={18} color="#059669" />
          <div style={{ fontSize: '0.88rem', color: '#065f46' }}>
            <strong>✓ Audio Approved</strong> — Review the audio and final text before submitting to dataset.
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="preview-actions-bar">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          {/* Approve Button (Marks as approved, does NOT save) */}
          {!isApproved ? (
            <button
              className="btn-approve"
              onClick={onApprove}
              disabled={isSubmitting || isRegenerating}
              title="Approve audio and final text"
            >
              <Check size={18} />
              <span>Approve</span>
            </button>
          ) : (
            /* Submit to Dataset Button (The ONLY action that saves to dataset) */
            <button
              className="btn-primary"
              onClick={onSubmit}
              disabled={isSubmitting || !finalText.trim() || isRegenerating}
              style={{ width: 'auto', padding: '0 24px', height: '44px', background: '#0284c7' }}
              title="Save this record to the dataset"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin-icon" />
                  <span>Submitting to Dataset...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit to Dataset</span>
                </>
              )}
            </button>
          )}
        </div>

        <button
          className="btn-discard"
          onClick={onDiscard}
          disabled={isSubmitting || isRegenerating}
          title={audioItem.source === 'generated' ? 'Discard generated audio' : 'Remove uploaded file'}
        >
          <Trash2 size={16} />
          <span>{audioItem.source === 'generated' ? 'Discard' : 'Remove'}</span>
        </button>
      </div>
    </div>
  );
};
