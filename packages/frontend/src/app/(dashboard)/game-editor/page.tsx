'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { IGameType } from '@rpsfull-platform/contracts';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/ui/loading-states';

export default function GameEditorListPage() {
  const router = useRouter();
  const [games, setGames] = useState<IGameType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await apiClient.get<IGameType[]>('/game-types/my');
      setGames(data);
    } catch (error: any) {
      toast.error('Failed to load games', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gameId: string, gameName: string) => {
    if (!confirm(`Are you sure you want to delete "${gameName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.delete(`/game-types/${gameId}`);
      toast.success('Game deleted', 'The game type has been deleted successfully');
      loadGames();
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Failed to delete game';
      toast.error('Delete failed', message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Game Editor</h1>
          <p className="text-gray-600 mt-2">Create and manage custom game types</p>
        </div>
        <Button
          onClick={() => router.push('/game-editor/create')}
          variant="primary"
          size="lg"
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Game
        </Button>
      </div>

      {games.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">You haven't created any games yet.</p>
          <p className="text-gray-500 text-sm mt-2">
            Start by creating a new game type to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{game.name}</h3>
                  {game.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{game.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {game.symbolCount} symbols
                </span>
                {game.isActive ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/game-editor/${game.id}/edit`)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1 flex-1"
                >
                  <Edit size={16} />
                  Edit
                </Button>
                <Button
                  onClick={() => router.push(`/game-editor/${game.id}/preview`)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1 flex-1"
                >
                  <Eye size={16} />
                  Preview
                </Button>
                <Button
                  onClick={() => handleDelete(game.id, game.name)}
                  variant="secondary"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


