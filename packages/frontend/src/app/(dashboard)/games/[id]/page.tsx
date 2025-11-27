'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IGameTypePublic } from '@rpsfull-platform/contracts';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Play, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function GameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const gameId = params.id as string;
  const [game, setGame] = useState<IGameTypePublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const data = await apiClient.get<IGameTypePublic>(`/game-types/${gameId}`);
        setGame(data);
      } catch (err: any) {
        const message = err?.response?.data?.error?.message || 'Failed to load game';
        toast.error('Load failed', message);
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  // Note: IGameTypePublic doesn't expose createdBy, so we can't check if user is creator
  const isCreator = false;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-2">Game Not Found</h2>
        <Button onClick={() => router.push('/games')} variant="secondary">
          Back to Game Library
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Button
            onClick={() => router.push('/games')}
            variant="secondary"
            size="sm"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Library
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
          {game.description && (
            <p className="text-gray-600 mt-2">{game.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            {game.isDefault && (
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">
                Official Game
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push(`/play?gameType=${gameId}`)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Play size={16} />
            Play Now
          </Button>
          {isCreator && (
            <Button
              onClick={() => router.push(`/game-editor/${gameId}/edit`)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Game Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Symbol Count:</span>
              <span className="ml-2 font-medium">{game.symbolCount}</span>
            </div>
            {game.isDefault && (
              <div>
                <span className="text-sm text-gray-600">Type:</span>
                <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  Official Game
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Symbols */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Symbols</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {game.symbols.map((symbol, idx) => (
              <div key={idx} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-2">{symbol.emoji}</div>
                <div className="text-sm font-medium">{symbol.name}</div>
                <div className="text-xs text-gray-500">{symbol.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Matrix */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Win Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                {game.symbols.map((symbol) => (
                  <th key={symbol.id} className="border border-gray-300 p-2 bg-gray-50 text-center min-w-[100px]">
                    <div className="text-2xl mb-1">{symbol.emoji}</div>
                    <div className="text-xs font-medium">{symbol.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {game.symbols.map((symbol) => (
                <tr key={symbol.id}>
                  <td className="border border-gray-300 p-2 bg-gray-50 text-center">
                    <div className="text-2xl mb-1">{symbol.emoji}</div>
                    <div className="text-xs font-medium">{symbol.name}</div>
                  </td>
                  {game.symbols.map((other) => {
                    const defeats = game.winMatrix[symbol.id] || [];
                    const isWin = defeats.includes(other.id);
                    const isLose = game.winMatrix[other.id]?.includes(symbol.id);
                    const relationship = symbol.id === other.id ? 'tie' : isWin ? 'wins' : isLose ? 'loses' : 'tie';
                    
                    return (
                      <td
                        key={other.id}
                        className={`border border-gray-300 p-4 text-center ${
                          relationship === 'wins' ? 'bg-green-100' :
                          relationship === 'loses' ? 'bg-red-100' :
                          'bg-gray-50'
                        }`}
                      >
                        <span className="text-xl font-bold">
                          {relationship === 'wins' ? '✓' : relationship === 'loses' ? '✗' : '-'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓</span>
            <span>Wins</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">✗</span>
            <span>Loses</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">-</span>
            <span>Tie</span>
          </div>
        </div>
      </div>
    </div>
  );
}

