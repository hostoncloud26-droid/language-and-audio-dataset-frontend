import React from 'react';
import { FolderKanban, Database, Mic, ChevronLeft, ChevronRight } from 'lucide-react';

export type NavTab = 'languages' | 'datasets' | 'collect';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'languages' as NavTab, label: 'Projects', icon: FolderKanban },
    { id: 'datasets' as NavTab, label: 'Datasets & Files', icon: Database },
    { id: 'collect' as NavTab, label: 'Collect Data', icon: Mic },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Mic size={20} />
          </div>
          {!collapsed && <span>Platform</span>}
        </div>
        <button 
          onClick={onToggleCollapse} 
          className="input-btn-right"
          style={{ position: 'static' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
