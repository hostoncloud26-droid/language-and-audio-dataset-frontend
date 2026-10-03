import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={32} className="spin-icon" color="var(--primary)" />
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Initializing Language & Audio Dataset Platform...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardLayout /> : <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <MainApp />
      </AudioPlayerProvider>
    </AuthProvider>
  );
};

export default App;
