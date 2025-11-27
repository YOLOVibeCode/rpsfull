'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTournament } from '@/hooks/api/useTournaments';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ICreateTournamentDto, TournamentType } from '@rpsfull-platform/contracts';

// Form state interface (uses 'type' for form field)
interface TournamentFormData {
  name: string;
  description: string;
  type: TournamentType; // Form uses 'type'
  gameTypeId: string;
  bestOfN: number;
  maxParticipants: number;
  startDate: string; // Form uses string for date input
}

export function CreateTournamentForm() {
  const router = useRouter();
  const createTournament = useCreateTournament();
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    type: TournamentType.SINGLE_ELIMINATION,
    gameTypeId: '',
    bestOfN: 3,
    maxParticipants: 16,
    startDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Transform form data to match backend expectations
      const apiData: ICreateTournamentDto = {
        name: formData.name,
        description: formData.description || undefined,
        gameTypeId: formData.gameTypeId,
        tournamentType: formData.type as any, // Transform 'type' to 'tournamentType'
        bestOfN: formData.bestOfN,
        maxParticipants: formData.maxParticipants,
        // Don't send startDate if empty - backend will handle it
        // If provided, send as ISO string - backend validator will transform it
      };
      
      const tournament = await createTournament.mutateAsync(apiData);
      router.push(`/tournaments/${tournament.id}`);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create tournament' });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === 'number'
        ? parseInt(e.target.value)
        : e.target.type === 'date'
        ? e.target.value
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Tournament</h2>

      <Input
        label="Tournament Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        error={errors.name}
        placeholder="Spring Championship 2024"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Tournament description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tournament Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={TournamentType.SINGLE_ELIMINATION}>Single Elimination</option>
          <option value={TournamentType.DOUBLE_ELIMINATION}>Double Elimination</option>
          <option value={TournamentType.ROUND_ROBIN}>Round Robin</option>
        </select>
      </div>

      <Input
        label="Game Type ID"
        name="gameTypeId"
        value={formData.gameTypeId}
        onChange={handleChange}
        required
        error={errors.gameTypeId}
        placeholder="classic-rps"
      />

      <Input
        label="Best of N"
        type="number"
        name="bestOfN"
        value={formData.bestOfN}
        onChange={handleChange}
        min={1}
        max={21}
        required
        error={errors.bestOfN}
      />

      <Input
        label="Max Participants"
        type="number"
        name="maxParticipants"
        value={formData.maxParticipants}
        onChange={handleChange}
        min={2}
        max={128}
        required
        error={errors.maxParticipants}
      />

      <Input
        label="Start Date"
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        required
        error={errors.startDate}
      />

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={createTournament.isPending}
        className="w-full"
      >
        Create Tournament
      </Button>
    </form>
  );
}

