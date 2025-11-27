'use client';

import { useState, useEffect } from 'react';
import { IGameTypeCreate, IWinMatrix, IGameSymbol } from '@rpsfull-platform/contracts';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface RulesEditorTabProps {
  data: Partial<IGameTypeCreate>;
  onChange: (updates: Partial<IGameTypeCreate>) => void;
  onNext: () => void;
  onBack: () => void;
}

type Relationship = 'wins' | 'loses' | 'tie';

export function RulesEditorTab({ data, onChange, onNext, onBack }: RulesEditorTabProps) {
  const symbols = data.symbols || [];
  const winMatrix = data.winMatrix || {};
  const [matrix, setMatrix] = useState<Record<string, Record<string, Relationship>>>({});

  useEffect(() => {
    // Initialize matrix from winMatrix
    const newMatrix: Record<string, Record<string, Relationship>> = {};
    symbols.forEach((symbol) => {
      newMatrix[symbol.id] = {};
      symbols.forEach((other) => {
        if (symbol.id === other.id) {
          newMatrix[symbol.id][other.id] = 'tie';
        } else if (winMatrix[symbol.id]?.includes(other.id)) {
          newMatrix[symbol.id][other.id] = 'wins';
        } else if (winMatrix[other.id]?.includes(symbol.id)) {
          newMatrix[symbol.id][other.id] = 'loses';
        } else {
          newMatrix[symbol.id][other.id] = 'tie';
        }
      });
    });
    setMatrix(newMatrix);
  }, [symbols, winMatrix]);

  const toggleRelationship = (symbolId: string, otherId: string) => {
    if (symbolId === otherId) return;

    const newMatrix = { ...matrix };
    const current = newMatrix[symbolId]?.[otherId] || 'tie';

    // Cycle: tie -> wins -> loses -> tie
    let next: Relationship = 'tie';
    if (current === 'tie') next = 'wins';
    else if (current === 'wins') next = 'loses';
    else next = 'tie';

    newMatrix[symbolId] = { ...newMatrix[symbolId], [otherId]: next };
    
    // Update opposite relationship
    if (next === 'wins') {
      newMatrix[otherId] = { ...newMatrix[otherId], [symbolId]: 'loses' };
    } else if (next === 'loses') {
      newMatrix[otherId] = { ...newMatrix[otherId], [symbolId]: 'wins' };
    } else {
      newMatrix[otherId] = { ...newMatrix[otherId], [symbolId]: 'tie' };
    }

    setMatrix(newMatrix);

    // Update winMatrix
    const newWinMatrix: IWinMatrix = {};
    symbols.forEach((symbol) => {
      const defeats: string[] = [];
      symbols.forEach((other) => {
        if (newMatrix[symbol.id]?.[other.id] === 'wins') {
          defeats.push(other.id);
        }
      });
      if (defeats.length > 0) {
        newWinMatrix[symbol.id] = defeats;
      }
    });
    onChange({ winMatrix: newWinMatrix });
  };

  const getCellClass = (relationship: Relationship) => {
    switch (relationship) {
      case 'wins':
        return 'bg-green-100 hover:bg-green-200 text-green-800';
      case 'loses':
        return 'bg-red-100 hover:bg-red-200 text-red-800';
      default:
        return 'bg-gray-100 hover:bg-gray-200 text-gray-600';
    }
  };

  const getCellLabel = (relationship: Relationship) => {
    switch (relationship) {
      case 'wins':
        return '✓';
      case 'loses':
        return '✗';
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Win Matrix</h2>
        <p className="text-gray-600">
          Define which symbols defeat which others. Click cells to toggle relationships.
        </p>
      </div>

      {symbols.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Please define symbols first.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                {symbols.map((symbol) => (
                  <th key={symbol.id} className="border border-gray-300 p-2 bg-gray-50 text-center min-w-[100px]">
                    <div className="text-2xl mb-1">{symbol.emoji}</div>
                    <div className="text-xs font-medium">{symbol.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => (
                <tr key={symbol.id}>
                  <td className="border border-gray-300 p-2 bg-gray-50 text-center">
                    <div className="text-2xl mb-1">{symbol.emoji}</div>
                    <div className="text-xs font-medium">{symbol.name}</div>
                  </td>
                  {symbols.map((other) => (
                    <td
                      key={other.id}
                      className={`border border-gray-300 p-4 text-center cursor-pointer transition-colors ${getCellClass(
                        matrix[symbol.id]?.[other.id] || 'tie'
                      )}`}
                      onClick={() => toggleRelationship(symbol.id, other.id)}
                      title={`${symbol.name} vs ${other.name}`}
                    >
                      <span className="text-xl font-bold">
                        {getCellLabel(matrix[symbol.id]?.[other.id] || 'tie')}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Legend</h3>
        <div className="flex gap-4 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓</span>
            <span>Wins</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">✗</span>
            <span>Loses</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">-</span>
            <span>Tie</span>
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
          Next: Test Game
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

