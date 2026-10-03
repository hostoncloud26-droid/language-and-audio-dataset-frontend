import React from 'react';
import { Search } from 'lucide-react';

interface LanguageSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const LanguageSearch: React.FC<LanguageSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="search-bar-container">
      <div className="search-input-box">
        <Search size={18} className="input-icon-left" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
