'use client';

import { useMyMatches } from '@/hooks/api/useMatches';
import { IMatch, MatchStatus } from '@rpsfull-platform/contracts';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface MatchListProps {
  limit?: number;
}

export function MatchList({ limit }: MatchListProps) {
  const { data: matches, isLoading, error } = useMyMatches();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Failed to load matches. Please try again.
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No matches found</p>
        <Link href="/play">
          <Button variant="primary">Create New Match</Button>
        </Link>
      </div>
    );
  }

  const displayMatches = limit ? matches.slice(0, limit) : matches;

  return (
    <div className="space-y-4">
      {displayMatches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function MatchCard({ match }: { match: IMatch }) {
  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case MatchStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case MatchStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case MatchStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/play/${match.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Match #{match.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-gray-600">
              {match.gameTypeId}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status as MatchStatus)}`}>
            {match.status}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span>Score: </span>
            <span className="font-semibold">{match.player1Score}</span>
            <span> - </span>
            <span className="font-semibold">{match.player2Score}</span>
          </div>
          {match.status === MatchStatus.PENDING && (
            <Button variant="outline" size="sm">
              Start Match
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}

