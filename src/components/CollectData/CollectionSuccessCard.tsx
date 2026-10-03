import React from 'react';
import { DatasetRecord } from '../../types';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { CheckCircle2, Play, Pause, PlusCircle, ArrowRight } from 'lucide-react';

interface CollectionSuccessCardProps {
  record: DatasetRecord;
  datasetId: string;
  onCollectAnother: () => void;
  onViewDatasets: () => void;
}

export const CollectionSuccessCard: React.FC<CollectionSuccessCardProps> = ({
  record,
  datasetId,
  onCollectAnother,
  onViewDatasets,
}) => {
  const { currentTrackId, isPlaying, toggleAudio } = useAudioPlayer();
  const isThisPlaying = currentTrackId === record.id && isPlaying;

  return (
    <div className="success-result-card">
      <div className="success-header-row">
        <div className="success-icon-badge">
          <CheckCircle2 size={26} />
        </div>
        <div>
          <h3 className="success-title">✓ Successfully added to Dataset</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
              Dataset ID:
            </span>
            <span className="success-id-pill">{record.id}</span>
          </div>
        </div>
      </div>

      {/* Recorded Details */}
      <div style={{ background: 'white', padding: '18px 20px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
          Text:
        </p>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
          "{record.text}"
        </p>

        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Audio:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className={`btn-play-mini ${isThisPlaying ? 'playing' : ''}`}
            onClick={() => toggleAudio(record.id, record.audio_url, typeof record.duration === 'number' ? record.duration : 4.0)}
          >
            {isThisPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
          </button>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {isThisPlaying ? 'Playing audio...' : 'Play'}
          </span>
        </div>
      </div>

      {/* Action Next Steps */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '0 20px', height: '42px', background: '#15803d' }}
          onClick={onCollectAnother}
        >
          <PlusCircle size={16} />
          <span>Collect Another Sample</span>
        </button>

        <button
          className="btn-secondary"
          style={{ height: '42px', padding: '0 18px', background: 'white' }}
          onClick={onViewDatasets}
        >
          <span>View in Datasets Table</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
