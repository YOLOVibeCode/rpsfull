'use client';

import { useLeaderboard } from '@/hooks/api/usePlayers';
import { IPlayer } from '@rpsfull-platform/contracts';
import Link from 'next/link';

interface LeaderboardProps {
  gameTypeId?: string;
  limit?: number;
}

export function Leaderboard({ gameTypeId, limit = 100 }: LeaderboardProps) {
  const { data: players, isLoading, error } = useLeaderboard(gameTypeId, limit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !players || players.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
        No leaderboard data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
      </div>
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player, index) => (
                  <LeaderboardRow key={player.id} player={player} rank={index + 1} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ player, rank }: { player: IPlayer; rank: number }) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-base sm:text-lg font-semibold">{getRankBadge(rank)}</span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <Link href={`/players/${player.id}`} className="flex items-center hover:text-primary-600">
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
            {player.avatarUrl ? (
              <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" src={player.avatarUrl} alt={player.name} />
            ) : (
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-xs sm:text-sm">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-2 sm:ml-4 min-w-0">
            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {player.displayName || player.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
              {player.name}
            </div>
          </div>
        </Link>
      </td>
      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        Level {player.level || 1}
      </td>
      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {/* Would need to fetch stats for each player */}
        -
      </td>
      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {/* Would need to fetch stats for each player */}
        -
      </td>
    </tr>
  );
}

