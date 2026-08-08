import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '../types';
import { loginApi, getMeApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickSwitchRole: (role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ROLE_PRESETS: Record<Role, { email: string; name: string; title: string }> = {
  ADMIN: { email: 'admin@erp.com', name: 'Alex Rivera', title: 'System Administrator' },
  SALES: { email: 'sales@erp.com', name: 'Sarah Connor', title: 'Senior Sales Manager' },
  WAREHOUSE: { email: 'warehouse@erp.com', name: 'Marcus Wright', title: 'Head Inventory Officer' },
  ACCOUNTS: { email: 'accounts@erp.com', name: 'Elena Vance', title: 'Chief Accounts Officer' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('erp_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('erp_token');
      if (savedToken) {
        try {
          const userData = await getMeApi();
          setUser(userData);
        } catch (err) {
          console.error('Failed to verify token', err);
          localStorage.removeItem('erp_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      localStorage.setItem('erp_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const quickSwitchRole = async (role: Role) => {
    const preset = ROLE_PRESETS[role];
    if (preset) {
      await login(preset.email, 'password123');
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        quickSwitchRole,
        logout,
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
