'use client';

import { useMyStatistics } from '@/hooks/api/useStatistics';
import { IPlayerStatisticsPublic } from '@rpsfull-platform/contracts';

interface PlayerStatisticsProps {
  gameTypeId?: string;
}

export function PlayerStatistics({ gameTypeId }: PlayerStatisticsProps) {
  const { data: stats, isLoading, error } = useMyStatistics(gameTypeId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        No statistics available yet. Play some matches to see your stats!
      </div>
    );
  }

  const winRate = stats.totalMatches > 0 
    ? ((stats.wins / stats.totalMatches) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Statistics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Matches" value={stats.totalMatches} />
        <StatCard label="Wins" value={stats.wins} color="text-green-600" />
        <StatCard label="Losses" value={stats.losses} color="text-red-600" />
        <StatCard label="Win Rate" value={`${winRate}%`} />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Match Statistics</h3>
          <div className="space-y-2">
            <StatRow label="Total Rounds Played" value={stats.totalRounds} />
            <StatRow label="Rounds Won" value={stats.roundsWon} />
            <StatRow label="Rounds Lost" value={stats.roundsLost} />
            <StatRow label="Ties" value={stats.ties} />
          </div>
        </div>

        {stats.moveStats && Object.keys(stats.moveStats).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Move Statistics</h3>
            <div className="space-y-2">
              {Object.entries(stats.moveStats).map(([move, count]) => (
                <StatRow key={move} label={move.charAt(0).toUpperCase() + move.slice(1)} value={count} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Win Streak */}
      {stats.currentWinStreak !== undefined && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Current Win Streak</span>
            <span className="text-2xl font-bold text-primary-600">{stats.currentWinStreak}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

