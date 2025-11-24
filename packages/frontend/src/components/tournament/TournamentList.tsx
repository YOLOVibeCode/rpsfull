'use client';

import { useTournaments } from '@/hooks/api/useTournaments';
import { ITournament, TournamentStatus } from '@rpsfull-platform/contracts';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface TournamentListProps {
  status?: TournamentStatus;
  limit?: number;
}

export function TournamentList({ status, limit }: TournamentListProps) {
  const { data: tournaments, isLoading, error } = useTournaments();

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
        Failed to load tournaments. Please try again.
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No tournaments found</p>
        <Link href="/tournaments/create">
          <Button variant="primary">Create Tournament</Button>
        </Link>
      </div>
    );
  }

  let filteredTournaments = tournaments;
  if (status) {
    filteredTournaments = tournaments.filter((t) => t.status === status);
  }

  const displayTournaments = limit ? filteredTournaments.slice(0, limit) : filteredTournaments;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayTournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}

function TournamentCard({ tournament }: { tournament: ITournament }) {
  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TournamentStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TournamentStatus.REGISTRATION_OPEN:
        return 'bg-yellow-100 text-yellow-800';
      case TournamentStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex-1">
            {tournament.name}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              tournament.status as TournamentStatus
            )}`}
          >
            {tournament.status}
          </span>
        </div>

        <p className="text-gray-600 mb-4 flex-1">{tournament.description}</p>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium capitalize">{tournament.type}</span>
          </div>
          <div className="flex justify-between">
            <span>Participants:</span>
            <span className="font-medium">
              {tournament.currentParticipants || 0} / {tournament.maxParticipants || '∞'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Start Date:</span>
            <span className="font-medium">{formatDate(tournament.startDate)}</span>
          </div>
          {tournament.endDate && (
            <div className="flex justify-between">
              <span>End Date:</span>
              <span className="font-medium">{formatDate(tournament.endDate)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}

