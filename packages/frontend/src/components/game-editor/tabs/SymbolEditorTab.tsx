'use client';

import { useState } from 'react';
import { IGameTypeCreate, IGameSymbol } from '@rpsfull-platform/contracts';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface SymbolEditorTabProps {
  data: Partial<IGameTypeCreate>;
  onChange: (updates: Partial<IGameTypeCreate>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SymbolEditorTab({ data, onChange, onNext, onBack }: SymbolEditorTabProps) {
  const [symbolCount, setSymbolCount] = useState(3);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [symbolForm, setSymbolForm] = useState<Partial<IGameSymbol>>({
    id: '',
    name: '',
    emoji: '',
  });

  const symbols = data.symbols || [];

  const validSymbolCounts = [3, 5, 7, 9, 11, 13, 15];

  const handleSymbolCountChange = (count: number) => {
    if (!validSymbolCounts.includes(count)) return;
    setSymbolCount(count);
    
    // Adjust symbols array to match new count
    const newSymbols = [...symbols];
    while (newSymbols.length < count) {
      newSymbols.push({
        id: `symbol-${newSymbols.length + 1}`,
        name: '',
        emoji: '',
      });
    }
    while (newSymbols.length > count) {
      newSymbols.pop();
    }
    onChange({ symbols: newSymbols });
  };

  const handleSymbolChange = (index: number, field: keyof IGameSymbol, value: string) => {
    const newSymbols = [...symbols];
    newSymbols[index] = { ...newSymbols[index], [field]: value };
    onChange({ symbols: newSymbols });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setSymbolForm(symbols[index] || { id: '', name: '', emoji: '' });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const newSymbols = [...symbols];
    newSymbols[editingIndex] = symbolForm as IGameSymbol;
    onChange({ symbols: newSymbols });
    setEditingIndex(null);
    setSymbolForm({ id: '', name: '', emoji: '' });
  };

  const canProceed = symbols.length >= 3 && symbols.every(s => s.name && s.emoji && s.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Symbol Editor</h2>
        <p className="text-gray-600">Define the symbols for your game. You need at least 3 symbols.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Symbols
          </label>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                const idx = validSymbolCounts.indexOf(symbolCount);
                if (idx > 0) handleSymbolCountChange(validSymbolCounts[idx - 1]);
              }}
              variant="secondary"
              disabled={validSymbolCounts.indexOf(symbolCount) === 0}
            >
              -
            </Button>
            <span className="px-4 py-2 bg-gray-100 rounded-lg font-medium min-w-[60px] text-center">
              {symbolCount}
            </span>
            <Button
              onClick={() => {
                const idx = validSymbolCounts.indexOf(symbolCount);
                if (idx < validSymbolCounts.length - 1) handleSymbolCountChange(validSymbolCounts[idx + 1]);
              }}
              variant="secondary"
              disabled={validSymbolCounts.indexOf(symbolCount) === validSymbolCounts.length - 1}
            >
              +
            </Button>
            <span className="text-sm text-gray-500 ml-4">
              Must be an odd number (3, 5, 7, 9, 11, 13, or 15)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symbols.map((symbol, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Symbol {index + 1}</span>
                <button
                  onClick={() => handleEdit(index)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Edit
                </button>
              </div>
              {editingIndex === index ? (
                <div className="space-y-2">
                  <Input
                    label="ID"
                    value={symbolForm.id || ''}
                    onChange={(e) => setSymbolForm({ ...symbolForm, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="rock"
                  />
                  <Input
                    label="Name"
                    value={symbolForm.name || ''}
                    onChange={(e) => setSymbolForm({ ...symbolForm, name: e.target.value })}
                    placeholder="Rock"
                  />
                  <Input
                    label="Emoji"
                    value={symbolForm.emoji || ''}
                    onChange={(e) => setSymbolForm({ ...symbolForm, emoji: e.target.value })}
                    placeholder="🪨"
                    maxLength={2}
                  />
                  <Button onClick={handleSaveEdit} variant="primary" size="sm" className="w-full">
                    Save
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">{symbol.emoji || '?'}</div>
                  <div className="text-sm font-medium">{symbol.name || 'Unnamed'}</div>
                  <div className="text-xs text-gray-500">{symbol.id || 'no-id'}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {symbols.length < symbolCount && (
          <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            Please define all {symbolCount} symbols before proceeding.
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button onClick={onBack} variant="secondary" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button
          onClick={onNext}
          variant="primary"
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          Next: Define Rules
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

