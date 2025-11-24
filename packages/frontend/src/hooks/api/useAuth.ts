/**
 * Authentication Hooks
 * 
 * React Query hooks for authentication API calls
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ILoginDto, IRegisterEmailDto, IUser } from '@rpsfull-platform/contracts';

export function useLogin() {
  return useMutation({
    mutationFn: async (data: ILoginDto) => {
      return apiClient.post<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', data);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: IRegisterEmailDto) => {
      return apiClient.post<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register/email', data);
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return apiClient.get<IUser>('/users/me');
    },
    retry: false,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      return apiClient.post('/auth/logout');
    },
  });
}

