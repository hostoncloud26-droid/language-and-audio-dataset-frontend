import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand-wrap">
          <div className={`brand-icon-small ${isAdmin ? 'admin-brand-icon' : ''}`}>
            {isAdmin ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
          </div>
          <span className="header-project-name">
            {isAdmin ? 'Dataset Management • Admin Portal' : 'Language & Audio Dataset Platform'}
          </span>
        </div>
        <span className="header-divider">/</span>
        <h1 className="header-page-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        {user && (
          <div className="user-profile">
            <div className={`user-avatar ${isAdmin ? 'admin-avatar' : ''}`}>
              {isAdmin ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name || user.username}</span>
              <span className={`user-role-badge ${isAdmin ? 'role-admin' : 'role-contributor'}`}>
                {isAdmin ? '🛡️ Administrator' : '👤 Verified Contributor'}
              </span>
            </div>
          </div>
        )}

        <button 
          className="btn-logout" 
          onClick={logout}
          title="Sign out of platform"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
