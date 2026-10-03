import React from 'react';
import { Language } from '../../types';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguageId: string | number;
  onSelectLanguage: (langId: string | number) => void;
  isLoading: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguageId,
  onSelectLanguage,
  isLoading,
}) => {
  return (
    <div className="language-picker-card">
      <div className="section-label">
        <Globe size={18} color="var(--primary)" />
        <span>Language</span>
      </div>

      <select
        className="custom-select-large"
        value={selectedLanguageId}
        onChange={(e) => onSelectLanguage(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Select Language ▼</option>
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
