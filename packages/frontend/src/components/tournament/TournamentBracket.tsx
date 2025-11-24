'use client';

import { useTournamentBracket } from '@/hooks/api/useTournaments';
import { IBracketData, IBracketMatch, IBracketRound } from '@rpsfull-platform/contracts';

interface TournamentBracketProps {
  tournamentId: string;
}

export function TournamentBracket({ tournamentId }: TournamentBracketProps) {
  const { data: bracket, isLoading, error } = useTournamentBracket(tournamentId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !bracket) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        Bracket not yet generated. Tournament must be started first.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-max px-4 sm:px-0">
        <BracketVisualization bracket={bracket} />
      </div>
    </div>
  );
}

function BracketVisualization({ bracket }: { bracket: IBracketData }) {
  const rounds = bracket.rounds || [];
  const maxRounds = rounds.length;

  return (
    <div className="flex gap-2 sm:gap-4 p-2 sm:p-4">
      {rounds.map((round, roundIndex) => (
        <BracketRound
          key={round.roundNumber}
          round={round}
          roundIndex={roundIndex}
          totalRounds={maxRounds}
        />
      ))}
    </div>
  );
}

function BracketRound({
  round,
  roundIndex,
  totalRounds,
}: {
  round: IBracketRound;
  roundIndex: number;
  totalRounds: number;
}) {
  const isFinal = roundIndex === totalRounds - 1;
  const isSemiFinal = roundIndex === totalRounds - 2;

  return (
    <div className="flex flex-col justify-center min-w-[160px] sm:min-w-[200px]">
      <div className="text-center mb-2 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-700">
          {isFinal ? 'Final' : isSemiFinal ? 'Semi-Final' : `Round ${round.roundNumber}`}
        </h3>
      </div>
      <div className="space-y-2 sm:space-y-4">
        {round.matches.map((match, matchIndex) => (
          <BracketMatch
            key={match.id}
            match={match}
            matchIndex={matchIndex}
            roundIndex={roundIndex}
            totalRounds={totalRounds}
          />
        ))}
      </div>
    </div>
  );
}

function BracketMatch({
  match,
  matchIndex,
  roundIndex,
  totalRounds,
}: {
  match: IBracketMatch;
  matchIndex: number;
  roundIndex: number;
  totalRounds: number;
}) {
  const hasWinner = match.winnerId !== null;
  const isFinal = roundIndex === totalRounds - 1;

  return (
    <div className="relative">
      <div
        className={`bg-white border-2 rounded-lg shadow-md ${
          hasWinner ? 'border-green-500' : 'border-gray-300'
        } ${isFinal ? 'border-2 sm:border-4 border-primary-600' : ''}`}
      >
        <div className="p-2 sm:p-4">
          {/* Player 1 */}
          <div
            className={`flex justify-between items-center py-2 px-3 rounded ${
              match.winnerId === match.player1Id ? 'bg-green-100 font-semibold' : ''
            }`}
          >
            <span className="text-sm truncate flex-1">
              {match.player1Name || `Player ${match.player1Id.slice(0, 8)}`}
            </span>
            {match.player1Score !== null && (
              <span className="text-sm font-semibold ml-2">{match.player1Score}</span>
            )}
          </div>

          {/* VS Separator */}
          <div className="h-px bg-gray-200 my-1"></div>

          {/* Player 2 */}
          <div
            className={`flex justify-between items-center py-2 px-3 rounded ${
              match.winnerId === match.player2Id ? 'bg-green-100 font-semibold' : ''
            }`}
          >
            <span className="text-sm truncate flex-1">
              {match.player2Name || `Player ${match.player2Id.slice(0, 8)}`}
            </span>
            {match.player2Score !== null && (
              <span className="text-sm font-semibold ml-2">{match.player2Score}</span>
            )}
          </div>

          {/* Match Status */}
          {match.status && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500 capitalize">{match.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Connector line to next round */}
      {roundIndex < totalRounds - 1 && (
        <div className="absolute top-1/2 -right-2 w-4 h-px bg-gray-400"></div>
      )}
    </div>
  );
}

