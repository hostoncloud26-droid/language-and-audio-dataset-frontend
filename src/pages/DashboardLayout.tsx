import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/common/Header';
import { Sidebar, NavTab } from '../components/common/Sidebar';
import { LanguagesPage } from './LanguagesPage';
import { DatasetsPage } from './DatasetsPage';
import { CollectDataPage } from './CollectDataPage';

export const DashboardLayout: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>(isAdmin ? 'languages' : 'collect');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin && window.location.pathname !== '/admin') {
      window.history.replaceState({}, '', '/admin');
    }
  }, [isAdmin]);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'languages':
        return 'Projects';
      case 'datasets':
        return isAdmin ? 'All Audio Recordings' : 'My Audio Recordings';
      case 'collect':
        return 'Collect & Record Audio';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="main-wrapper">
        <Header pageTitle={getPageTitle()} />

        <main style={{ flex: 1 }}>
          {activeTab === 'languages' && <LanguagesPage />}
          {activeTab === 'datasets' && (
            <DatasetsPage onNavigateToCollect={() => setActiveTab('collect')} />
          )}
          {activeTab === 'collect' && (
            <CollectDataPage onNavigateToDatasets={() => setActiveTab('datasets')} />
          )}
        </main>
      </div>
    </div>
  );
};
