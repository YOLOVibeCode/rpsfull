'use client';

import { useState } from 'react';
import { IGameTypeCreate } from '@rpsfull-platform/contracts';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface PublishTabProps {
  data: Partial<IGameTypeCreate>;
  onChange: (updates: Partial<IGameTypeCreate>) => void;
  onBack: () => void;
  onPublish: () => Promise<void>;
}

export function PublishTab({ data, onBack, onPublish }: PublishTabProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const validationChecks = [
    {
      label: 'Game name is set',
      valid: !!data.name && data.name.trim().length >= 3,
    },
    {
      label: 'At least 3 symbols defined',
      valid: !!data.symbols && data.symbols.length >= 3,
    },
    {
      label: 'All symbols have name and emoji',
      valid:
        !!data.symbols &&
        data.symbols.every((s) => s.name && s.emoji && s.id),
    },
    {
      label: 'Win matrix is defined',
      valid: !!data.winMatrix && Object.keys(data.winMatrix).length > 0,
    },
  ];

  const allValid = validationChecks.every((check) => check.valid);

  const handlePublish = async () => {
    if (!allValid) {
      toast.error('Validation failed', 'Please complete all required fields');
      return;
    }

    setIsPublishing(true);
    try {
      await apiClient.post('/game-types', {
        name: data.name,
        description: data.description,
        symbols: data.symbols,
        winMatrix: data.winMatrix,
        tieRules: data.tieRules || 'replay',
        scoringMethod: data.scoringMethod || 'best_of_n',
      });

      toast.success('Game created!', 'Your game type has been created successfully');
      router.push('/game-editor');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Failed to create game';
      toast.error('Publish failed', message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Publish Your Game</h2>
        <p className="text-gray-600">Review your game and publish it when ready.</p>
      </div>

      {/* Validation Checklist */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Validation Checklist</h3>
        <div className="space-y-3">
          {validationChecks.map((check, index) => (
            <div key={index} className="flex items-center gap-3">
              {check.valid ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <XCircle className="text-red-600" size={20} />
              )}
              <span className={check.valid ? 'text-gray-900' : 'text-gray-500'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Name:</span>
            <span className="ml-2 font-medium">{data.name || 'Unnamed'}</span>
          </div>
          {data.description && (
            <div>
              <span className="text-sm text-gray-600">Description:</span>
              <p className="mt-1 text-sm">{data.description}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">Symbols:</span>
            <div className="flex gap-2 mt-2">
              {data.symbols?.map((symbol, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <span>{symbol.emoji}</span>
                  <span className="text-sm">{symbol.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="secondary" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button
          onClick={handlePublish}
          variant="primary"
          disabled={!allValid || isPublishing}
          isLoading={isPublishing}
          className="flex items-center gap-2"
        >
          {isPublishing ? 'Publishing...' : 'Publish Game'}
        </Button>
      </div>
    </div>
  );
}

