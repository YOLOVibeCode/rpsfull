'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameEditor } from '@/components/game-editor/GameEditor';
import { IGameTypeCreate } from '@rpsfull-platform/contracts';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/lib/toast';

export default function CreateGamePage() {
  const router = useRouter();
  const [gameData, setGameData] = useState<Partial<IGameTypeCreate>>({
    name: '',
    description: '',
    symbols: [],
    winMatrix: {},
    tieRules: 'replay',
    scoringMethod: 'best_of_n',
  });

  const handleSave = async (data: IGameTypeCreate) => {
    try {
      await apiClient.post('/game-types', {
        name: data.name,
        description: data.description,
        symbols: data.symbols,
        winMatrix: data.winMatrix,
        tieRules: data.tieRules,
        scoringMethod: data.scoringMethod,
      });

      toast.success('Game saved!', 'Your game has been saved as a draft');
      router.push('/game-editor');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Failed to save game';
      toast.error('Save failed', message);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/game-editor');
  };

  return (
    <GameEditor
      initialData={gameData}
      onSave={handleSave}
      onCancel={handleCancel}
      mode="create"
    />
  );
}

