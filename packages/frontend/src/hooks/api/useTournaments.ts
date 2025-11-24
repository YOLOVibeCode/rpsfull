/**
 * Tournament Hooks
 * 
 * React Query hooks for tournament API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ICreateTournamentDto, ITournament } from '@rpsfull-platform/contracts';

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

