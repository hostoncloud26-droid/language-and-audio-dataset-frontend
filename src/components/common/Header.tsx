import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Mic } from 'lucide-react';

interface HeaderProps {
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand-wrap">
          <div className="brand-icon-small">
            <Mic size={18} />
          </div>
          <span className="header-project-name">Language & Audio Dataset Platform</span>
        </div>
        <span className="header-divider">/</span>
        <h1 className="header-page-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        {user && (
          <div className="user-profile">
            <div className="user-avatar">
              <UserIcon size={18} />
            </div>
            <div className="user-details">
              <span className="user-name">{user.name || user.username}</span>
              <span className="user-role">{user.role || 'User'}</span>
            </div>
          </div>
        )}

        <button 
          className="btn-logout" 
          onClick={logout}
          title="Sign out of platform"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
