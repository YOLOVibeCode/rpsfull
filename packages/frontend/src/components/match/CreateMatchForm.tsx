'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMatch } from '@/hooks/api/useMatches';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ICreateMatchDto, PlayMode } from '@rpsfull-platform/contracts';

export function CreateMatchForm() {
  const router = useRouter();
  const createMatch = useCreateMatch();
  const [formData, setFormData] = useState<ICreateMatchDto>({
    player2Id: '',
    gameTypeId: '',
    bestOfN: 3,
    playMode: PlayMode.DIGITAL_FACE_TO_FACE,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const match = await createMatch.mutateAsync(formData);
      router.push(`/play/${match.id}`);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create match' });
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
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
          Game Type ID
        </label>
        <Input
          name="gameTypeId"
          value={formData.gameTypeId}
          onChange={handleChange}
          required
          error={errors.gameTypeId}
          placeholder="classic-rps"
        />
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
    </form>
  );
}

