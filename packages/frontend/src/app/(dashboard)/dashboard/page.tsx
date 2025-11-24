'use client';

import { MatchList } from '@/components/match/MatchList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/play" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">New Match</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Matches</h2>
        <MatchList limit={5} />
      </div>
    </div>
  );
}

