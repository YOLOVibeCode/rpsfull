'use client';

import { CreateTournamentForm } from '@/components/tournament/CreateTournamentForm';

export default function CreateTournamentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Tournament</h1>
      <CreateTournamentForm />
    </div>
  );
}

