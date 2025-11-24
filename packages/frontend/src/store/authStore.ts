/**
 * Auth Store (Zustand)
 * 
 * Global authentication state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '@rpsfull-platform/contracts';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: IUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

