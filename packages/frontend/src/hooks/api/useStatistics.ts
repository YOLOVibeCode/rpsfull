/**
 * Statistics Hooks
 * 
 * React Query hooks for statistics API calls
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { IPlayerStatisticsPublic, IHeadToHeadStatsDto, IGlobalStatsDto } from '@rpsfull-platform/contracts';

export function usePlayerStatistics(playerId: string, gameTypeId?: string) {
  return useQuery({
    queryKey: ['playerStatistics', playerId, gameTypeId],
    queryFn: async () => {
      const params = gameTypeId ? `?gameTypeId=${gameTypeId}` : '';
      return apiClient.get<IPlayerStatisticsPublic>(`/stats/users/me/stats${params}`);
    },
    enabled: !!playerId,
  });
}

export function useMyStatistics(gameTypeId?: string) {
  return useQuery({
    queryKey: ['myStatistics', gameTypeId],
    queryFn: async () => {
      const params = gameTypeId ? `?gameTypeId=${gameTypeId}` : '';
      return apiClient.get<IPlayerStatisticsPublic>(`/stats/users/me/stats${params}`);
    },
  });
}

export function useHeadToHeadStats(player1Id: string, player2Id: string, gameTypeId?: string) {
  return useQuery({
    queryKey: ['headToHead', player1Id, player2Id, gameTypeId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('player1Id', player1Id);
      params.append('player2Id', player2Id);
      if (gameTypeId) params.append('gameTypeId', gameTypeId);
      return apiClient.get<IHeadToHeadStatsDto>(`/stats/head-to-head?${params.toString()}`);
    },
    enabled: !!player1Id && !!player2Id,
  });
}

export function useGlobalStats(gameTypeId?: string) {
  return useQuery({
    queryKey: ['globalStats', gameTypeId],
    queryFn: async () => {
      const params = gameTypeId ? `?gameTypeId=${gameTypeId}` : '';
      return apiClient.get<IGlobalStatsDto>(`/stats/global${params}`);
    },
  });
}

