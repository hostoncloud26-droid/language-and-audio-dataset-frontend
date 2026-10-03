import React, { useRef } from 'react';
import { Upload, FileAudio } from 'lucide-react';

interface AudioUploadBoxProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

export const AudioUploadBox: React.FC<AudioUploadBoxProps> = ({
  onFileSelected,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelected(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        onFileSelected(file);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        border: '2px dashed var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px 20px',
        textAlign: 'center',
        background: '#fafafa',
        marginTop: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="audio/*"
        style={{ display: 'none' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileAudio size={24} />
        </div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
          {isUploading ? 'Processing selected audio file...' : 'Choose audio file or drag & drop here'}
        </p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Select any backend-supported audio file
        </span>
      </div>
    </div>
  );
};
