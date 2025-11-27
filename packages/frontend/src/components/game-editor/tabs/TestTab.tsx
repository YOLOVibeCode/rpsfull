'use client';

import { useState } from 'react';
import { IGameTypeCreate } from '@rpsfull-platform/contracts';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

interface TestTabProps {
  data: Partial<IGameTypeCreate>;
  onChange: (updates: Partial<IGameTypeCreate>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TestTab({ data, onNext, onBack }: TestTabProps) {
  const symbols = data.symbols || [];
  const winMatrix = data.winMatrix || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Your Game</h2>
        <p className="text-gray-600">Test your game to make sure everything works correctly.</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Test mode coming soon!</strong> This feature will allow you to play test rounds
          against an AI opponent to verify your game mechanics work correctly.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Game Preview</h3>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-600">Game Name:</span>
            <span className="ml-2 font-medium">{data.name || 'Unnamed'}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Symbols:</span>
            <div className="flex gap-2 mt-2">
              {symbols.map((symbol, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <span>{symbol.emoji}</span>
                  <span className="text-sm">{symbol.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Win Matrix:</span>
            <div className="mt-2 text-sm">
              {Object.keys(winMatrix).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(winMatrix).map(([symbolId, defeats]) => {
                    const symbol = symbols.find((s) => s.id === symbolId);
                    const defeatNames = defeats
                      .map((id) => symbols.find((s) => s.id === id)?.name)
                      .filter(Boolean);
                    return (
                      <li key={symbolId}>
                        <strong>{symbol?.name}</strong> defeats: {defeatNames.join(', ') || 'none'}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="text-gray-400">No win relationships defined</span>
              )}
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
          onClick={onNext}
          variant="primary"
          className="flex items-center gap-2"
        >
          Next: Publish
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

