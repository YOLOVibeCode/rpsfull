/**
 * Player Hooks
 * 
 * React Query hooks for player API calls
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { IPlayer } from '@rpsfull-platform/contracts';

export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      return apiClient.get<IPlayer>(`/players/${playerId}`);
    },
    enabled: !!playerId,
  });
}

export function usePlayers(search?: string, limit?: number) {
  return useQuery({
    queryKey: ['players', search, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (limit) params.append('limit', limit.toString());
      const queryString = params.toString();
      return apiClient.get<IPlayer[]>(`/players${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useLeaderboard(gameTypeId?: string, limit: number = 100) {
  return useQuery({
    queryKey: ['leaderboard', gameTypeId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (gameTypeId) params.append('gameTypeId', gameTypeId);
      params.append('limit', limit.toString());
      return apiClient.get<IPlayer[]>(`/players/leaderboard?${params.toString()}`);
    },
  });
}

