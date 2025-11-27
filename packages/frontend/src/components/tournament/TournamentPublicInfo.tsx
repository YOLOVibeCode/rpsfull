'use client';

import { IPublicTournamentDto, TournamentStatus } from '@rpsfull-platform/contracts';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';

interface TournamentPublicInfoProps {
  tournament: IPublicTournamentDto;
}

/**
 * TournamentPublicInfo Component
 * 
 * Displays tournament information for public viewing
 * Following ISP: Single responsibility - display public tournament data
 */
export function TournamentPublicInfo({ tournament }: TournamentPublicInfoProps) {
  const isRegistrationOpen = tournament.status === TournamentStatus.REGISTRATION_OPEN;
  const isFull = tournament.maxParticipants && tournament.currentParticipants >= tournament.maxParticipants;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
          {tournament.description && (
            <p className="text-gray-600">{tournament.description}</p>
          )}
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
          {tournament.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="text-lg font-semibold capitalize">{tournament.tournamentType.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-sm text-gray-600">Participants</p>
            <p className="text-lg font-semibold">
              {tournament.currentParticipants} / {tournament.maxParticipants || '∞'}
            </p>
          </div>
        </div>

        {tournament.startDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-lg font-semibold">
                {new Date(tournament.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {tournament.registrationDeadline && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Registration</p>
              <p className="text-lg font-semibold">
                {new Date(tournament.registrationDeadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary-600" />
          <div>
            <p className="text-sm text-gray-600">Game Type</p>
            <p className="text-lg font-semibold">{tournament.gameType.name}</p>
            {tournament.gameType.description && (
              <p className="text-sm text-gray-500 mt-1">{tournament.gameType.description}</p>
            )}
          </div>
        </div>
      </div>

      {isFull && isRegistrationOpen && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Tournament is full. No more registrations accepted.
        </div>
      )}
    </div>
  );
}

