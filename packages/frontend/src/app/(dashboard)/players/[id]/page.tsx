'use client';

import { useParams } from 'next/navigation';
import { usePlayer } from '@/hooks/api/usePlayers';
import { usePlayerStatistics } from '@/hooks/api/useStatistics';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);
  const { data: stats, isLoading: statsLoading } = usePlayerStatistics(playerId);

  if (playerLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Player not found.
      </div>
    );
  }

  return (
    <div>
      {/* Player Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-6">
          {player.avatarUrl ? (
            <img
              className="h-24 w-24 rounded-full"
              src={player.avatarUrl}
              alt={player.name}
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-bold text-3xl">
                {player.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{player.displayName || player.name}</h1>
            <p className="text-gray-600">{player.name}</p>
            {player.bio && <p className="text-gray-700 mt-2">{player.bio}</p>}
            <div className="flex items-center space-x-4 mt-4">
              <div>
                <span className="text-sm text-gray-600">Level</span>
                <span className="ml-2 text-lg font-semibold">{player.level || 1}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Experience</span>
                <span className="ml-2 text-lg font-semibold">{player.experience || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statsLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : stats ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMatches}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Wins</p>
              <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Losses</p>
              <p className="text-2xl font-bold text-red-600">{stats.losses}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalMatches > 0
                  ? `${((stats.wins / stats.totalMatches) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          No statistics available for this player.
        </div>
      )}
    </div>
  );
}

