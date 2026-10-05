import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { api, getStoredToken, getStoredUser, clearStoredAuth } from '../services/api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name?: string, role?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check initial auth state from storage
    const existingToken = getStoredToken();
    const existingUser = getStoredUser();

    if (existingToken && existingUser) {
      setToken(existingToken);
      setUser(existingUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login(username, password);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, name?: string, role?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.register(username, password, name, role);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
