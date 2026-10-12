import React from 'react';
import { FileText, Lock, X } from 'lucide-react';

interface TextInputAreaProps {
  text: string;
  onTextChange: (text: string) => void;
  onGenerate?: () => void;
  onUploadClick?: () => void;
  onFileSelected?: (file: File) => void;
  isGenerating?: boolean;
  isUploading?: boolean;
  isLocked?: boolean;
  selectedLanguageName: string;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onTextChange,
  isLocked = false,
  selectedLanguageName,
}) => {
  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label className="form-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 0 }}>
          <FileText size={16} color="var(--primary)" />
          <span>Speech Text</span>
          {isLocked && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#94a3b8',
                background: '#1e1e2d',
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
        placeholder={`Enter what you are going to speak about before recording (${selectedLanguageName})...`}
        value={text}
        onChange={(e) => {
          if (!isLocked) {
            onTextChange(e.target.value);
          }
        }}
        readOnly={isLocked}
        style={
          isLocked
            ? {
                background: '#121217',
                color: 'var(--text-muted)',
                cursor: 'not-allowed',
                borderColor: '#22222e',
                boxShadow: 'none',
              }
            : {}
        }
      />
    </div>
  );
};
