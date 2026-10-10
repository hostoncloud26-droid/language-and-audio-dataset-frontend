import React, { useRef } from 'react';
import { Sparkles, Upload, Loader2, FileText, Lock, X, Lightbulb } from 'lucide-react';

interface TextInputAreaProps {
  text: string;
  onTextChange: (text: string) => void;
  onGenerate?: () => void;
  onUploadClick: () => void;
  onFileSelected?: (file: File) => void;
  isGenerating: boolean;
  isUploading: boolean;
  isLocked?: boolean;
  selectedLanguageName: string;
}

const SAMPLE_PROMPTS: Record<string, string[]> = {
  English: [
    'Hello, welcome to the speech dataset collection platform.',
    'Natural language processing requires diverse acoustic training data.',
    'The weather forecast predicts clear skies throughout the afternoon.',
  ],
  Tamil: [
    'வணக்கம், இந்த தரவுத்தளத்தில் புதிய குரல் பதிவு சேர்க்கப்படுகிறது.',
    'தமிழ் மொழி இனிமையான மற்றும் பழமையான செம்மொழியாகும்.',
  ],
  Hindi: [
    'नमस्ते, यह एक बहुभाषी वाणी डेटासेट संग्रह मंच है।',
    'कृत्रिम बुद्धिमत्ता और ध्वनि पहचान तकनीक में निरंतर प्रगति हो रही है।',
  ],
  Malayalam: [
    'നമസ്കാരം, ഇത് ഒരു ബഹുഭാഷാ സംഭാഷണ ഡാറ്റാസെറ്റ് ശേഖരണ പ്ലാറ്റ്ഫോമാണ്.',
  ],
  Telugu: [
    'నమస్కారం, ఇది బహుభాషా ప్రసంగ డేటాసెట్ సేకరణ వేదిక.',
  ],
};

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onTextChange,
  onGenerate,
  onUploadClick,
  onFileSelected,
  isGenerating,
  isUploading,
  isLocked = false,
  selectedLanguageName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sampleList = SAMPLE_PROMPTS[selectedLanguageName] || SAMPLE_PROMPTS.English;

  const handleUploadBtnClick = () => {
    if (onFileSelected && fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    } else {
      onUploadClick();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelected) {
      onFileSelected(file);
    }
  };

  return (
    <div>
      {/* Hidden Native File Input for Instant Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.aac"
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label className="form-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} color="var(--primary)" />
          <span>Original Text</span>
          {isLocked && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#475569',
                background: '#e2e8f0',
                padding: '2px 8px',
                borderRadius: '4px',
                marginLeft: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Lock size={12} /> Read-Only
            </span>
          )}
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isLocked && text.length > 0 && (
            <button
              type="button"
              onClick={() => onTextChange('')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Clear text"
            >
              <X size={13} />
              <span>Clear</span>
            </button>
          )}

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {wordsCount} words • {text.length} chars
          </span>
        </div>
      </div>

      <textarea
        className="textarea-custom"
        placeholder={`Enter text in ${selectedLanguageName} to synthesize audio or upload an audio file...`}
        value={text}
        onChange={(e) => {
          if (!isLocked) {
            onTextChange(e.target.value);
          }
        }}
        readOnly={isLocked}
        disabled={isGenerating || isUploading}
        style={
          isLocked
            ? {
                background: '#f8fafc',
                color: '#334155',
                cursor: 'not-allowed',
                borderColor: '#cbd5e1',
                boxShadow: 'none',
              }
            : {}
        }
      />

      {/* Quick Sample Prompts Pills (When not locked and text is empty) */}
      {!isLocked && !text && sampleList && sampleList.length > 0 && (
        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <Lightbulb size={13} color="var(--warning)" />
            <span>Try a sample utterance for {selectedLanguageName}:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {sampleList.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-chip"
                onClick={() => onTextChange(sample)}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                title="Click to insert this sample"
              >
                <span>"{sample.length > 45 ? sample.slice(0, 45) + '...' : sample}"</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TTS Speech Generation Indicator (Commented out per request) */}
      {/*
      {isGenerating && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spin-icon" />
              Synthesizing speech via Edge Neural TTS & uploading to server...
            </span>
          </div>
          <div className="skeleton" style={{ height: '8px', background: '#bae6fd' }}>
            <div className="audio-progress-fill" style={{ width: '100%', background: 'var(--primary)' }} />
          </div>
        </div>
      )}
      */}

      {/* Uploading to Server Progress Indicator */}
      {isUploading && (
        <div style={{ marginBottom: '18px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spin-icon" />
              Uploading audio to remote Chibisafe server...
            </span>
          </div>
          <div className="skeleton" style={{ height: '8px', background: '#bbf7d0' }}>
            <div className="audio-progress-fill" style={{ width: '100%', background: '#16a34a' }} />
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      {!isLocked && (
        <div className="action-buttons-row">
          {/* TTS Audio Generator Button - Commented out per request */}
          {/*
          <button
            type="button"
            className="btn-action-generate"
            onClick={onGenerate}
            disabled={!text.trim() || isGenerating || isUploading}
            title={!text.trim() ? 'Enter text to synthesize speech' : 'Synthesize speech from entered text with Edge Neural TTS'}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Generating Speech (TTS)...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Audio (TTS)</span>
              </>
            )}
          </button>
          */}

          <button
            type="button"
            className="btn-action-upload"
            onClick={handleUploadBtnClick}
            disabled={isGenerating || isUploading}
            title="Upload audio directly to remote server"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Uploading to Server...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload Audio</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

