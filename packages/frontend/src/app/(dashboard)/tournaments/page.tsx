'use client';

import { useState } from 'react';
import { TournamentList } from '@/components/tournament/TournamentList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TournamentStatus } from '@rpsfull-platform/contracts';

export default function TournamentsPage() {
  const [filter, setFilter] = useState<TournamentStatus | undefined>(undefined);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tournaments</h1>
        <Link href="/tournaments/create" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">Create Tournament</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 sm:space-x-4 mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setFilter(undefined)}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            filter === undefined
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter(TournamentStatus.REGISTRATION_OPEN)}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            filter === TournamentStatus.REGISTRATION_OPEN
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Open Registration
        </button>
        <button
          onClick={() => setFilter(TournamentStatus.IN_PROGRESS)}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            filter === TournamentStatus.IN_PROGRESS
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter(TournamentStatus.COMPLETED)}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap ${
            filter === TournamentStatus.COMPLETED
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed
        </button>
      </div>

      <TournamentList status={filter} />
    </div>
  );
}

