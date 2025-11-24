'use client';

import { useState } from 'react';
import { PlayerStatistics } from '@/components/stats/PlayerStatistics';
import { Leaderboard } from '@/components/stats/Leaderboard';
import { useGameTypes } from '@/hooks/api/useGameTypes';

export default function StatsPage() {
  const [selectedGameType, setSelectedGameType] = useState<string | undefined>(undefined);
  const { data: gameTypes } = useGameTypes();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Statistics</h1>
        {gameTypes && gameTypes.length > 0 && (
          <select
            value={selectedGameType || ''}
            onChange={(e) => setSelectedGameType(e.target.value || undefined)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
          >
            <option value="">All Game Types</option>
            {gameTypes.map((gt) => (
              <option key={gt.id} value={gt.id}>
                {gt.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-8">
        <PlayerStatistics gameTypeId={selectedGameType} />
        <Leaderboard gameTypeId={selectedGameType} limit={50} />
      </div>
    </div>
  );
}

