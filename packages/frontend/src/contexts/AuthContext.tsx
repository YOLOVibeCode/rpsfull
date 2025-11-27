'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { IUserPublic, ILoginDto, IRegisterDto } from '@rpsfull-platform/contracts';
import { toast } from '@/lib/toast';
import { eventBus, Events } from '@/lib/events/eventBus';

interface AuthContextType {
  user: IUserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: ILoginDto) => Promise<void>;
  register: (data: IRegisterDto & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserPublic | null>(null);
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
      user: IUserPublic;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', data);

    apiClient.setToken(response.accessToken);
    apiClient.setRefreshToken(response.refreshToken);
    setUser(response.user);
    
    // Show welcome toast
    toast.success('Welcome back!');
    eventBus.emit(Events.TOAST_SHOW, { type: 'success', message: 'Welcome back!' });
  };

  const register = async (data: IRegisterDto & { password: string }) => {
    // Filter out empty optional fields to avoid validation errors
    const cleanedData: IRegisterDto & { password: string } = {
      username: data.username,
      email: data.email,
      password: data.password,
      ...(data.firstName && data.firstName.trim() ? { firstName: data.firstName.trim() } : {}),
      ...(data.lastName && data.lastName.trim() ? { lastName: data.lastName.trim() } : {}),
      ...(data.displayName && data.displayName.trim() ? { displayName: data.displayName.trim() } : {}),
    };

    const response = await apiClient.post<{
      user: IUserPublic;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', cleanedData);

    apiClient.setToken(response.accessToken);
    apiClient.setRefreshToken(response.refreshToken);
    setUser(response.user);
    
    // Show success toast
    toast.success('Account created successfully!');
    eventBus.emit(Events.TOAST_SHOW, { type: 'success', message: 'Account created successfully!' });
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
      const userData = await apiClient.get<IUserPublic>('/users/me');
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

