import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { Loader2 } from 'lucide-react';

import { AuthLoadingScreen } from './components/common/AuthLoadingScreen';

const checkIsAdminPath = () => {
  const p = window.location.pathname.toLowerCase();
  const s = window.location.search.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/admin' || p.startsWith('/admin') || s.includes('admin') || h.includes('admin');
};

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isAdminPortal, setIsAdminPortal] = useState<boolean>(checkIsAdminPath);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminPortal(checkIsAdminPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAdminSwitch = (adminMode: boolean) => {
    setIsAdminPortal(adminMode);
    if (adminMode) {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  if (isLoading) {
    return <AuthLoadingScreen isAdmin={isAdminPortal} />;
  }

  if (isAuthenticated) {
    return <DashboardLayout />;
  }

  return authView === 'login' ? (
    <LoginPage
      onNavigateToRegister={() => setAuthView('register')}
      isAdminPortal={isAdminPortal}
      onAdminSwitch={handleAdminSwitch}
    />
  ) : (
    <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
  );
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
