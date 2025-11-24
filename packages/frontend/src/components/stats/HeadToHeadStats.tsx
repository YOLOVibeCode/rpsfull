'use client';

import { useHeadToHeadStats } from '@/hooks/api/useStatistics';
import { IHeadToHeadStatsDto } from '@rpsfull-platform/contracts';

interface HeadToHeadStatsProps {
  player1Id: string;
  player2Id: string;
  gameTypeId?: string;
}

export function HeadToHeadStats({ player1Id, player2Id, gameTypeId }: HeadToHeadStatsProps) {
  const { data: stats, isLoading, error } = useHeadToHeadStats(player1Id, player2Id, gameTypeId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
        No head-to-head statistics available.
      </div>
    );
  }

  const totalMatches = stats.player1Wins + stats.player2Wins + stats.ties;
  const player1WinRate = totalMatches > 0 
    ? ((stats.player1Wins / totalMatches) * 100).toFixed(1)
    : '0.0';
  const player2WinRate = totalMatches > 0
    ? ((stats.player2Wins / totalMatches) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Head-to-Head Statistics</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Player 1 Stats */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Player 1</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.player1Wins}</div>
          <div className="text-sm text-gray-600">Wins ({player1WinRate}%)</div>
        </div>

        {/* Player 2 Stats */}
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Player 2</h3>
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.player2Wins}</div>
          <div className="text-sm text-gray-600">Wins ({player2WinRate}%)</div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{totalMatches}</div>
          <div className="text-sm text-gray-600">Total Matches</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.ties}</div>
          <div className="text-sm text-gray-600">Ties</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.totalRounds}</div>
          <div className="text-sm text-gray-600">Total Rounds</div>
        </div>
      </div>

      {/* Recent Matches */}
      {stats.recentMatches && stats.recentMatches.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Matches</h3>
          <div className="space-y-2">
            {stats.recentMatches.slice(0, 5).map((match, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">
                  {new Date(match.date).toLocaleDateString()}
                </span>
                <span className="text-sm font-medium">
                  {match.winnerId === player1Id ? 'Player 1' : match.winnerId === player2Id ? 'Player 2' : 'Tie'}
                </span>
                <span className="text-sm text-gray-600">
                  {match.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

