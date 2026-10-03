import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Sidebar, NavTab } from '../components/common/Sidebar';
import { LanguagesPage } from './LanguagesPage';
import { DatasetsPage } from './DatasetsPage';
import { CollectDataPage } from './CollectDataPage';

export const DashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('languages');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'languages':
        return 'Projects & Languages';
      case 'datasets':
        return 'Audio Datasets';
      case 'collect':
        return 'Collect & Annotate Audio';
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
