'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateMatch } from '@/hooks/api/useMatches';
import { useGameTypes } from '@/hooks/api/useGameTypes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ICreateMatchDto, PlayMode } from '@rpsfull-platform/contracts';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';
import { eventBus, Events } from '@/lib/events/eventBus';

export function CreateMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMatch = useCreateMatch();
  const { data: gameTypes, isLoading: gameTypesLoading } = useGameTypes(true); // Only active games
  
  const [formData, setFormData] = useState<ICreateMatchDto>({
    player2Id: '',
    gameTypeId: searchParams.get('gameType') || '',
    bestOfN: 3,
    playMode: PlayMode.DIGITAL_FACE_TO_FACE,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const match = await toast.promise(
        createMatch.mutateAsync(formData),
        {
          loading: 'Creating match...',
          success: 'Match created successfully!',
          error: 'Failed to create match',
        }
      );
      
      eventBus.emit(Events.MATCH_CREATED, match);
      router.push(`/play/${match.id}`);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create match';
      setErrors({ submit: errorMessage });
      toast.error('Match creation failed', errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 bg-card border rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Match</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opponent Player ID
        </label>
        <Input
          name="player2Id"
          value={formData.player2Id}
          onChange={handleChange}
          required
          error={errors.player2Id}
          placeholder="Enter opponent's player ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Game Type
        </label>
        {gameTypesLoading ? (
          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            Loading game types...
          </div>
        ) : gameTypes && gameTypes.length > 0 ? (
          <select
            name="gameTypeId"
            value={formData.gameTypeId}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.gameTypeId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a game type</option>
            {gameTypes.map((gameType) => (
              <option key={gameType.id} value={gameType.id}>
                {gameType.name} {gameType.isDefault && '(Official)'}
              </option>
            ))}
          </select>
        ) : (
          <Input
            name="gameTypeId"
            value={formData.gameTypeId}
            onChange={handleChange}
            required
            error={errors.gameTypeId}
            placeholder="Enter game type ID"
          />
        )}
        {errors.gameTypeId && (
          <p className="mt-1 text-sm text-red-600">{errors.gameTypeId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Best of N
        </label>
        <Input
          type="number"
          name="bestOfN"
          value={formData.bestOfN}
          onChange={handleChange}
          min={1}
          max={21}
          required
          error={errors.bestOfN}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Play Mode
        </label>
        <select
          name="playMode"
          value={formData.playMode}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={PlayMode.DIGITAL_FACE_TO_FACE}>Digital Face-to-Face</option>
          <option value={PlayMode.LIVE_RECORDING}>Live Recording</option>
        </select>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={createMatch.isPending}
        className="w-full"
      >
        Create Match
      </Button>
    </motion.form>
  );
}

