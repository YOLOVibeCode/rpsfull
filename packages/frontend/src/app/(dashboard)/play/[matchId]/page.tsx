'use client';

import { useParams } from 'next/navigation';
import { MatchGameplay } from '@/components/match/MatchGameplay';

export default function MatchPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  return <MatchGameplay matchId={matchId} />;
}

