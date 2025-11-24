/**
 * Game Type Hooks
 * 
 * React Query hooks for game type API calls
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { IGameTypePublic } from '@rpsfull-platform/contracts';

export function useGameTypes(activeOnly?: boolean) {
  return useQuery({
    queryKey: ['gameTypes', activeOnly],
    queryFn: async () => {
      const params = activeOnly ? '?active=true' : '';
      return apiClient.get<IGameTypePublic[]>(`/game-types${params}`);
    },
  });
}

export function useGameType(gameTypeId: string) {
  return useQuery({
    queryKey: ['gameType', gameTypeId],
    queryFn: async () => {
      return apiClient.get<IGameTypePublic>(`/game-types/${gameTypeId}`);
    },
    enabled: !!gameTypeId,
  });
}

