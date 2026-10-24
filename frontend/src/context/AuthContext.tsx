import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, isForceMockMode, setForceMockMode } from '../services/api';

interface User {
  email: string;
  organization?: string;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (credentials: { email?: string; password?: string; apiKey?: string }) => Promise<void>;
  logout: () => void;
  toggleMockMode: (force?: boolean) => void;
}

const DEFAULT_USER: User = {
  email: 'analyst@cloudbreaker.io',
  organization: 'Open Satellite Earth Observation',
  role: 'Earth Observation Analyst',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => api.getAuthToken() || 'cloudbreaker_guest_token');
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('clarityx_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMockMode, setIsMockModeState] = useState<boolean>(isForceMockMode());

  useEffect(() => {
    if (!api.getAuthToken()) {
      api.setAuthToken('cloudbreaker_guest_token');
    }
    const handleMockChange = () => {
      setIsMockModeState(isForceMockMode());
    };
    window.addEventListener('clarityx_mock_mode_changed', handleMockChange);
    return () => window.removeEventListener('clarityx_mock_mode_changed', handleMockChange);
  }, []);

  const login = async (credentials: { email?: string; password?: string; apiKey?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setToken(res.access_token);
      const loggedUser = res.user || {
        email: credentials.email || (credentials.apiKey ? 'api_agent@cloudbreaker.io' : DEFAULT_USER.email),
        organization: 'Open Satellite Earth Observation',
        role: credentials.apiKey ? 'Machine Intelligence Key' : 'Earth Observation Analyst',
      };
      setUser(loggedUser);
      localStorage.setItem('clarityx_user', JSON.stringify(loggedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Keep user in guest mode instead of blocking them
    setUser(DEFAULT_USER);
    localStorage.removeItem('clarityx_user');
  };

  const toggleMockMode = (force?: boolean) => {
    const nextVal = force !== undefined ? force : !isMockMode;
    setForceMockMode(nextVal);
    setIsMockModeState(nextVal);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: true, // Always allow access without locking user out
        isLoading,
        isMockMode,
        login,
        logout,
        toggleMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
