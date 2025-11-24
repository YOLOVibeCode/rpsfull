'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { IUser, ILoginDto, IRegisterDto } from '@rpsfull-platform/contracts';

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: ILoginDto) => Promise<void>;
  register: (data: IRegisterDto & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: ILoginDto) => {
    const response = await apiClient.post<{
      user: IUser;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', data);

    apiClient.setToken(response.accessToken);
    apiClient.setRefreshToken(response.refreshToken);
    setUser(response.user);
  };

  const register = async (data: IRegisterDto & { password: string }) => {
    const response = await apiClient.post<{
      user: IUser;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', data);

    apiClient.setToken(response.accessToken);
    apiClient.setRefreshToken(response.refreshToken);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
    }
    apiClient.setToken('');
    apiClient.setRefreshToken('');
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.get<IUser>('/users/me');
      setUser(userData);
    } catch (error) {
      setUser(null);
      apiClient.setToken('');
      apiClient.setRefreshToken('');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

