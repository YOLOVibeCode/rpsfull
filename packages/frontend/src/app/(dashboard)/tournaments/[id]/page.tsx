'use client';

import { useParams } from 'next/navigation';
import { useTournament, useStartTournament } from '@/hooks/api/useTournaments';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';
import { TournamentRegistration } from '@/components/tournament/TournamentRegistration';
import { TournamentShareCard } from '@/components/tournament/TournamentShareCard';
import { Button } from '@/components/ui/Button';
import { ShareButton } from '@/components/ui/ShareButton';
import { TournamentStatus } from '@rpsfull-platform/contracts';
import { useAuth } from '@/contexts/AuthContext';

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { user } = useAuth();
  const { data: tournament, isLoading } = useTournament(tournamentId);
  const startTournament = useStartTournament();

  const handleStartTournament = async () => {
    if (!confirm('Are you sure you want to start this tournament? This will generate the bracket.')) {
      return;
    }

    try {
      await startTournament.mutateAsync(tournamentId);
    } catch (error: any) {
      alert(error.message || 'Failed to start tournament');
    }
  };

  if (isLoading || !tournament) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isOrganizer = tournament.organizerId === user?.id;
  const canStart =
    isOrganizer &&
    tournament.status === TournamentStatus.REGISTRATION_OPEN &&
    (tournament.currentParticipants || 0) >= 2;

  return (
    <div>
      {/* Tournament Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
            <p className="text-gray-600">{tournament.description}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              tournament.status === TournamentStatus.COMPLETED
                ? 'bg-green-100 text-green-800'
                : tournament.status === TournamentStatus.IN_PROGRESS
                ? 'bg-blue-100 text-blue-800'
                : tournament.status === TournamentStatus.REGISTRATION_OPEN
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {tournament.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="text-lg font-semibold capitalize">{tournament.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Participants</p>
            <p className="text-lg font-semibold">
              {tournament.currentParticipants || 0} / {tournament.maxParticipants || '∞'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="text-lg font-semibold">
              {tournament.startDate
                ? new Date(tournament.startDate).toLocaleDateString()
                : 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Best of N</p>
            <p className="text-lg font-semibold">{tournament.bestOfN}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4 items-center">
          {canStart && (
            <Button
              onClick={handleStartTournament}
              isLoading={startTournament.isPending}
              variant="primary"
            >
              Start Tournament
            </Button>
          )}
          
          {/* Share Button - Show public link */}
          {tournament.status === TournamentStatus.REGISTRATION_OPEN && (
            <ShareButton
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/t/${tournamentId}`}
              title={`Join ${tournament.name}`}
              text={`Join ${tournament.name} tournament!`}
              variant="outline"
            />
          )}
        </div>
      </div>

      {/* Share Card (Organizer) */}
      {isOrganizer && tournament.status === TournamentStatus.REGISTRATION_OPEN && (
        <div className="mb-6">
          <TournamentShareCard
            tournamentId={tournamentId}
            tournamentName={tournament.name}
            isOrganizer={isOrganizer}
          />
        </div>
      )}

      {/* Registration */}
      {tournament.status === TournamentStatus.REGISTRATION_OPEN && (
        <div className="mb-6">
          <TournamentRegistration tournament={tournament} />
        </div>
      )}

      {/* Bracket */}
      {tournament.status === TournamentStatus.IN_PROGRESS ||
      tournament.status === TournamentStatus.COMPLETED ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Bracket</h2>
          <TournamentBracket tournamentId={tournamentId} />
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          Bracket will be generated when the tournament starts.
        </div>
      )}
    </div>
  );
}

