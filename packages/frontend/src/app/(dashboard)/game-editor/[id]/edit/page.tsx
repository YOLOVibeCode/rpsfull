'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GameEditor } from '@/components/game-editor/GameEditor';
import { IGameTypeCreate, IGameType } from '@rpsfull-platform/contracts';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/ui/loading-states';

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;
  const [gameData, setGameData] = useState<Partial<IGameTypeCreate> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const game = await apiClient.get<IGameType>(`/game-types/${gameId}`);
        setGameData({
          name: game.name,
          description: game.description,
          symbols: game.symbols,
          winMatrix: game.winMatrix,
          tieRules: game.tieRules,
          scoringMethod: game.scoringMethod,
        });
      } catch (err: any) {
        const message = err?.response?.data?.error?.message || 'Failed to load game';
        setError(message);
        toast.error('Load failed', message);
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  const handleSave = async (data: IGameTypeCreate) => {
    try {
      await apiClient.patch(`/game-types/${gameId}`, {
        name: data.name,
        description: data.description,
        symbols: data.symbols,
        winMatrix: data.winMatrix,
        tieRules: data.tieRules,
        scoringMethod: data.scoringMethod,
      });

      toast.success('Game updated!', 'Your game type has been updated successfully');
      router.push('/game-editor');
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Failed to update game';
      toast.error('Update failed', message);
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/game-editor');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Game</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => router.push('/game-editor')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Game Editor
        </button>
      </div>
    );
  }

  if (!gameData) {
    return null;
  }

  return (
    <GameEditor
      initialData={gameData}
      gameId={gameId}
      onSave={handleSave}
      onCancel={handleCancel}
      mode="edit"
    />
  );
}

