/**
 * Match Hooks
 * 
 * React Query hooks for match API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ICreateMatchDto, IMatch } from '@rpsfull-platform/contracts';

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateMatchDto) => {
      return apiClient.post<IMatch>('/matches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      return apiClient.get<IMatch>(`/matches/${matchId}`);
    },
    enabled: !!matchId,
  });
}

export function useMyMatches() {
  return useQuery({
    queryKey: ['matches', 'my'],
    queryFn: async () => {
      return apiClient.get<IMatch[]>('/matches/my');
    },
  });
}

export function useStartMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      return apiClient.patch<IMatch>(`/matches/${matchId}/start`);
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useSubmitMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, ...data }: { matchId: string; move: string; roundNumber?: number }) => {
      return apiClient.post(`/matches/${matchId}/rounds`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['match', variables.matchId] });
    },
  });
}

export function useCancelMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      return apiClient.delete(`/matches/${matchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useCreateMatchWithInvitation() {
  return useMutation({
    mutationFn: async (data: {
      player1: { firstName: string; lastName: string; email: string };
      invitedPlayerEmail?: string;
      gameTypeId?: string;
      bestOfN?: number;
      expirationHours?: number;
    }) => {
      return apiClient.post<{
        matchId: string;
        invitationToken: string;
        invitationLink: string;
        qrCodeDataUrl: string;
        expiresAt: string;
        player1Name: string;
      }>('/matches/create-with-invitation', data);
    },
  });
}

export function useJoinMatchByToken() {
  return useMutation({
    mutationFn: async (data: {
      token: string;
      player2: { firstName: string; lastName: string; email: string };
    }) => {
      return apiClient.post<{ matchId: string }>(`/matches/join/${data.token}`, data);
    },
  });
}

export function useGetInvitationDetails(token: string) {
  return useQuery({
    queryKey: ['invitation-details', token],
    queryFn: async () => {
      return apiClient.get<{
        matchId: string;
        invitationToken: string;
        invitationLink: string;
        qrCodeDataUrl: string;
        expiresAt: string;
        player1Name: string;
      }>(`/matches/join/${token}`);
    },
    enabled: !!token,
  });
}

