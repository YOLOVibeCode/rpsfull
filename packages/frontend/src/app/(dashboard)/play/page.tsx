'use client';

import { CreateMatchForm } from '@/components/match/CreateMatchForm';
import { MatchList } from '@/components/match/MatchList';

export default function PlayPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Play</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create Match</h2>
          <CreateMatchForm />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Matches</h2>
          <MatchList />
        </div>
      </div>
    </div>
  );
}

