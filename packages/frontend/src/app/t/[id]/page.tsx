'use client';

import { useParams } from 'next/navigation';
import { usePublicTournament } from '@/hooks/api/useTournaments';
import { TournamentPublicInfo } from '@/components/tournament/TournamentPublicInfo';
import { TournamentRegistration } from '@/components/tournament/TournamentRegistration';
import { LoginToRegisterCTA } from '@/components/tournament/LoginToRegisterCTA';
import { EmailRegistrationForm } from '@/components/tournament/EmailRegistrationForm';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { TournamentStatus } from '@rpsfull-platform/contracts';

/**
 * Public Tournament Page
 * 
 * Short URL: /t/{tournament-id}
 * No authentication required to view
 * Following ISP: Single responsibility - public tournament display
 */
export default function PublicTournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const { user } = useAuth();
  const { data: tournament, isLoading, error } = usePublicTournament(tournamentId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading tournament...</p>
        </div>
      </main>
    );
  }

  if (error || !tournament) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tournament Not Found</h1>
          <p className="text-gray-600 mb-6">
            This tournament doesn't exist or is no longer available.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Home
          </a>
        </div>
      </main>
    );
  }

  const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;
  const isFull = tournament.maxParticipants && tournament.currentParticipants >= tournament.maxParticipants;

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Tournament Info */}
        <TournamentPublicInfo tournament={tournament} />

        {/* Registration Section */}
        {isRegistrationOpen && !isFull && (
          <div className="mb-6 space-y-6">
            {user ? (
              // User is logged in - show registration component
              <TournamentRegistration 
                tournament={tournament as any} // Type assertion needed due to interface mismatch
                onRegistered={() => {
                  // Refresh tournament data
                  window.location.reload();
                }}
              />
            ) : (
              // User not logged in - show options
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Join This Tournament</h3>
                  
                  {/* Email Registration (Magic Link) */}
                  <div className="mb-6">
                    <EmailRegistrationForm tournamentId={tournamentId} />
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Login/Signup CTA */}
                  <LoginToRegisterCTA tournamentId={tournamentId} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Tournament Status Messages */}
        {!isRegistrationOpen && (
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
            {tournament.status === TournamentStatus.IN_PROGRESS && (
              <p>This tournament is currently in progress. Registration is closed.</p>
            )}
            {tournament.status === TournamentStatus.COMPLETED && (
              <p>This tournament has been completed. Registration is closed.</p>
            )}
            {tournament.status === TournamentStatus.DRAFT && (
              <p>This tournament is not yet open for registration.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

