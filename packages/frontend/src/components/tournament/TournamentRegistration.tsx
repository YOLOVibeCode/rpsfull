'use client';

import { useState } from 'react';
import { useRegisterTournament } from '@/hooks/api/useTournaments';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { ITournament, TournamentStatus } from '@rpsfull-platform/contracts';

interface TournamentRegistrationProps {
  tournament: ITournament;
  onRegistered?: () => void;
}

export function TournamentRegistration({ tournament, onRegistered }: TournamentRegistrationProps) {
  const { user } = useAuth();
  const registerTournament = useRegisterTournament();
  const [isRegistering, setIsRegistering] = useState(false);

  const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;
  const isFull =
    tournament.maxParticipants &&
    tournament.currentParticipants &&
    tournament.currentParticipants >= tournament.maxParticipants;

  const handleRegister = async () => {
    if (!user) return;

    setIsRegistering(true);
    try {
      await registerTournament.mutateAsync({
        tournamentId: tournament.id,
      });
      onRegistered?.();
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.message || 'Failed to register for tournament');
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isRegistrationOpen) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
        Registration is not open for this tournament.
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        Tournament is full. No more registrations accepted.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Register for Tournament</h3>
      <p className="text-gray-600 mb-4">
        Join this tournament and compete for the championship!
      </p>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">
          {tournament.currentParticipants || 0} / {tournament.maxParticipants || '∞'} participants
        </span>
      </div>
      <Button
        onClick={handleRegister}
        variant="primary"
        isLoading={isRegistering || registerTournament.isPending}
        className="w-full"
      >
        Register Now
      </Button>
    </div>
  );
}

