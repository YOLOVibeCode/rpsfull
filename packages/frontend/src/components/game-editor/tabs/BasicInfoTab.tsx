'use client';

import { useState } from 'react';
import { IGameTypeCreate } from '@rpsfull-platform/contracts';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

interface BasicInfoTabProps {
  data: Partial<IGameTypeCreate>;
  onChange: (updates: Partial<IGameTypeCreate>) => void;
  onNext: () => void;
}

export function BasicInfoTab({ data, onChange, onNext }: BasicInfoTabProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name || data.name.trim().length < 3) {
      newErrors.name = 'Game name must be at least 3 characters';
    } else if (data.name.length > 100) {
      newErrors.name = 'Game name must be less than 100 characters';
    }

    if (data.description && data.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Start by giving your game a name and description.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            label="Game Name"
            name="name"
            value={data.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            required
            error={errors.name}
            placeholder="e.g., Rock Paper Scissors Lizard Spock"
            maxLength={100}
          />
          <div className="mt-1 text-xs text-gray-500">
            {data.name?.length || 0} / 100 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
            <span className="text-gray-400 ml-1">(optional)</span>
          </label>
          <textarea
            name="description"
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe your game type..."
            maxLength={1000}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            {data.description?.length || 0} / 1000 characters
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Next Steps</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Define symbols for your game (e.g., Rock, Paper, Scissors)</li>
            <li>• Set up win/loss relationships between symbols</li>
            <li>• Test your game before publishing</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleNext}
          variant="primary"
          disabled={!data.name || data.name.trim().length < 3}
          className="flex items-center gap-2"
        >
          Next: Define Symbols
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

