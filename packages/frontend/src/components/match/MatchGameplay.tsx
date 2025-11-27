'use client';

import { useState, useEffect } from 'react';
import { useMatch, useStartMatch, useSubmitMove } from '@/hooks/api/useMatches';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { IMatch, MatchStatus, RoundResult } from '@rpsfull-platform/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerWinConfetti } from '@/components/ui/confetti';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { eventBus, Events } from '@/lib/events/eventBus';
import { RoundResultAnimation } from './RoundResultAnimation';

interface MatchGameplayProps {
  matchId: string;
}

export function MatchGameplay({ matchId }: MatchGameplayProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { data: match, isLoading } = useMatch(matchId);
  const startMatch = useStartMatch();
  const submitMove = useSubmitMove();

  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  useEffect(() => {
    if (!socket || !matchId) return;

    // Join match room
    socket.emit('match:join', matchId);

    // Listen for match updates
    socket.on('match:updated', (data: { match: IMatch }) => {
      // Handle match updates
      console.log('Match updated:', data);
    });

    socket.on('move:submitted', (data: any) => {
      // Handle move submission
      console.log('Move submitted:', data);
    });

    socket.on('round:completed', (data: any) => {
      setRoundResult(data.result);
      setCurrentRound((prev) => prev + 1);
      setWaitingForOpponent(false);
      
      // Emit round event
      eventBus.emit(Events.ROUND_PLAYED, data);
      
      // Show toast for round result
      if (data.result === RoundResult.WIN) {
        toast.success('You won this round!', 'Great move!');
      } else if (data.result === RoundResult.LOSS) {
        toast.info('You lost this round', 'Better luck next round!');
      } else {
        toast.info('Round tied', 'Try again!');
      }
    });

    socket.on('match:completed', (data: any) => {
      // Handle match completion
      eventBus.emit(Events.MATCH_COMPLETED, data);
      
      // Check if current user won
      const isWinner = data.winnerId === user?.id;
      if (isWinner) {
        triggerWinConfetti();
        toast.success('Match Won!', 'Congratulations!');
      } else {
        toast.info('Match Completed', 'Thanks for playing!');
      }
    });

    return () => {
      socket.emit('match:leave', matchId);
      socket.off('match:updated');
      socket.off('move:submitted');
      socket.off('round:completed');
      socket.off('match:completed');
    };
  }, [socket, matchId]);

  const handleStartMatch = async () => {
    try {
      await toast.promise(
        startMatch.mutateAsync(matchId),
        {
          loading: 'Starting match...',
          success: 'Match started!',
          error: 'Failed to start match',
        }
      );
      eventBus.emit(Events.MATCH_UPDATED, { matchId, status: MatchStatus.IN_PROGRESS });
    } catch (error: any) {
      toast.error('Failed to start match', error.message);
    }
  };

  const handleMoveSelect = (move: string) => {
    setSelectedMove(move);
  };

  const handleSubmitMove = async () => {
    if (!selectedMove || !match) return;

    setWaitingForOpponent(true);

    try {
      // Submit via API
      await submitMove.mutateAsync({
        matchId,
        move: selectedMove,
        roundNumber: currentRound,
      });

      // Also emit via socket for real-time updates
      socket?.emit('match:move', {
        matchId,
        move: selectedMove,
        roundNumber: currentRound,
      });

      setSelectedMove(null);
    } catch (error) {
      console.error('Failed to submit move:', error);
      setWaitingForOpponent(false);
    }
  };

  if (isLoading || !match) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isPlayer1 = match.player1Id === user?.id;
  const isPlayer2 = match.player2Id === user?.id;
  const isParticipant = isPlayer1 || isPlayer2;

  if (!isParticipant) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        You are not a participant in this match.
      </div>
    );
  }

  const canStart = match.status === MatchStatus.PENDING && isPlayer1;
  const canPlay = match.status === MatchStatus.IN_PROGRESS;

  return (
    <>
      <RoundResultAnimation
        result={roundResult}
        onAnimationComplete={() => setRoundResult(null)}
      />
      <motion.div
        className="max-w-4xl mx-auto p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
      {/* Match Header */}
      <motion.div
        className="bg-card border rounded-lg shadow-md p-4 sm:p-6 mb-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Match #{match.id.slice(0, 8)}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            match.status === MatchStatus.COMPLETED ? 'bg-green-100 text-green-800' :
            match.status === MatchStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {match.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Player 1</p>
            <p className="text-lg font-semibold">{match.player1Score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Player 2</p>
            <p className="text-lg font-semibold">{match.player2Score}</p>
          </div>
        </div>

        {canStart && (
          <div className="mt-4">
            <Button
              onClick={handleStartMatch}
              isLoading={startMatch.isPending}
              variant="primary"
              className="w-full"
            >
              Start Match
            </Button>
          </div>
        )}
      </motion.div>

      {/* Gameplay Area */}
      <AnimatePresence>
        {canPlay && (
          <motion.div
            className="bg-card border rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
          <h3 className="text-xl font-semibold mb-4 text-center">
            Round {currentRound} of {match.bestOfN}
          </h3>

          {waitingForOpponent ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Waiting for opponent to make their move...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                {['rock', 'paper', 'scissors'].map((move, index) => (
                  <motion.button
                    key={move}
                    onClick={() => handleMoveSelect(move)}
                    className={`p-4 sm:p-6 rounded-lg border-2 touch-manipulation ${
                      selectedMove === move
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">
                      {move === 'rock' && '🪨'}
                      {move === 'paper' && '📄'}
                      {move === 'scissors' && '✂️'}
                    </div>
                    <p className="text-sm sm:text-lg font-semibold capitalize">{move}</p>
                  </motion.button>
                ))}
              </div>

              {selectedMove && (
                <Button
                  onClick={handleSubmitMove}
                  isLoading={submitMove.isPending}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Submit Move
                </Button>
              )}

              <AnimatePresence>
                {roundResult && (
                  <motion.div
                    className="mt-6 p-4 bg-accent rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <p className="text-center text-lg font-semibold">
                      Round Result: {roundResult}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {match.status === MatchStatus.COMPLETED && (
          <motion.div
            className="bg-green-500/10 border border-green-500/50 text-green-600 px-4 py-3 rounded-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-xl font-semibold mb-2">Match Completed!</p>
            <p>Winner: {match.winnerId === match.player1Id ? 'Player 1' : 'Player 2'}</p>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
}

