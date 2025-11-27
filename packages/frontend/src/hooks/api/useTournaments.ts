/**
 * Tournament Hooks
 * 
 * React Query hooks for tournament API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ICreateTournamentDto,
  ITournament,
  IPublicTournamentDto,
  ITournamentInvitationResponseDto,
} from '@rpsfull-platform/contracts';

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateTournamentDto) => {
      return apiClient.post<ITournament>('/tournaments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      return apiClient.get<ITournament[]>('/tournaments');
    },
  });
}

export function useTournament(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      return apiClient.get<ITournament>(`/tournaments/${tournamentId}`);
    },
    enabled: !!tournamentId,
  });
}

export function useTournamentBracket(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament', tournamentId, 'bracket'],
    queryFn: async () => {
      return apiClient.get(`/tournaments/${tournamentId}/bracket`);
    },
    enabled: !!tournamentId,
  });
}

export function useRegisterTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, ...data }: { tournamentId: string }) => {
      return apiClient.post(`/tournaments/${tournamentId}/register`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useStartTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      return apiClient.patch(`/tournaments/${tournamentId}/start`);
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

/**
 * Get public tournament information (no authentication required)
 */
export function usePublicTournament(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament-public', tournamentId],
    queryFn: async () => {
      return apiClient.get<IPublicTournamentDto>(`/tournaments/${tournamentId}/public`);
    },
    enabled: !!tournamentId,
  });
}

/**
 * Create tournament invitation (organizer only)
 */
export function useCreateTournamentInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      return apiClient.post<ITournamentInvitationResponseDto>(`/tournaments/${tournamentId}/invitation`);
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament-invitation', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
    },
  });
}

/**
 * Get tournament invitation details
 */
export function useTournamentInvitation(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament-invitation', tournamentId],
    queryFn: async () => {
      return apiClient.get<ITournamentInvitationResponseDto>(`/tournaments/${tournamentId}/invitation`);
    },
    enabled: !!tournamentId,
    retry: false,
  });
}

