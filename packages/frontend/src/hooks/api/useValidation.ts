'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface UseValidationOptions {
  enabled?: boolean;
}

export function useUsernameValidation(username: string, options?: UseValidationOptions) {
  return useQuery({
    queryKey: ['username-validation', username],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: { username: string; isAvailable: boolean } }>(
        `/auth/check-username?username=${encodeURIComponent(username)}`
      );
      return response.data;
    },
    enabled: (options?.enabled !== false) && username.length >= 3,
    staleTime: 5000, // Cache for 5 seconds
  });
}

export function useEmailValidation(email: string, options?: UseValidationOptions) {
  const isValidEmail = email.includes('@') && email.includes('.');
  
  return useQuery({
    queryKey: ['email-validation', email],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: { email: string; isAvailable: boolean; message?: string } }>(
        `/auth/check-email?email=${encodeURIComponent(email)}`
      );
      return response.data;
    },
    enabled: (options?.enabled !== false) && isValidEmail,
    staleTime: 5000, // Cache for 5 seconds
  });
}

// Helper hook for email validation that returns a simpler interface
export function useEmailValidationSimple(email: string, options?: UseValidationOptions) {
  const { data, isLoading } = useEmailValidation(email, options);
  
  return {
    isValid: data?.data.isAvailable ?? true,
    message: data?.data.message,
    checking: isLoading,
    exists: data?.data.isAvailable === false,
  };
}
