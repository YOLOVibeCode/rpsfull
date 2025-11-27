'use client';

import { useState, useEffect } from 'react';
import { IGameTypeCreate, IGameType } from '@rpsfull-platform/contracts';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { SymbolEditorTab } from './tabs/SymbolEditorTab';
import { RulesEditorTab } from './tabs/RulesEditorTab';
import { TestTab } from './tabs/TestTab';
import { PublishTab } from './tabs/PublishTab';
import { Button } from '@/components/ui/Button';
import { Save, X } from 'lucide-react';

type TabId = 'basic' | 'symbols' | 'rules' | 'test' | 'publish';

interface GameEditorProps {
  initialData?: Partial<IGameTypeCreate>;
  gameId?: string;
  mode: 'create' | 'edit';
  onSave: (data: IGameTypeCreate) => Promise<void>;
  onCancel: () => void;
}

export function GameEditor({
  initialData = {},
  gameId,
  mode,
  onSave,
  onCancel,
}: GameEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [gameData, setGameData] = useState<Partial<IGameTypeCreate>>({
    name: '',
    description: '',
    symbols: [],
    winMatrix: {},
    tieRules: 'replay',
    scoringMethod: 'best_of_n',
    ...initialData,
  });

  const tabs: { id: TabId; label: string; disabled?: boolean }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'symbols', label: 'Symbols', disabled: !gameData.name },
    { id: 'rules', label: 'Rules', disabled: !gameData.symbols || gameData.symbols.length === 0 },
    { id: 'test', label: 'Test', disabled: !gameData.winMatrix || Object.keys(gameData.winMatrix).length === 0 },
    { id: 'publish', label: 'Publish', disabled: !gameData.winMatrix || Object.keys(gameData.winMatrix).length === 0 },
  ];

  const updateGameData = (updates: Partial<IGameTypeCreate>) => {
    setGameData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!gameData.name || !gameData.symbols || gameData.symbols.length === 0 || !gameData.winMatrix) {
      return;
    }

    await onSave(gameData as IGameTypeCreate);
  };

  const canSave = gameData.name && gameData.symbols && gameData.symbols.length > 0 && gameData.winMatrix;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Game' : 'Edit Game'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'create' ? 'Design your custom game type' : 'Update your game type'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={!canSave}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {tabs.filter((t) => !t.disabled).length} / {tabs.length} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{
              width: `${(tabs.filter((t) => !t.disabled).length / tabs.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : tab.disabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <BasicInfoTab
              data={gameData}
              onChange={updateGameData}
              onNext={() => setActiveTab('symbols')}
            />
          )}
          {activeTab === 'symbols' && (
            <SymbolEditorTab
              data={gameData}
              onChange={updateGameData}
              onNext={() => setActiveTab('rules')}
              onBack={() => setActiveTab('basic')}
            />
          )}
          {activeTab === 'rules' && (
            <RulesEditorTab
              data={gameData}
              onChange={updateGameData}
              onNext={() => setActiveTab('test')}
              onBack={() => setActiveTab('symbols')}
            />
          )}
          {activeTab === 'test' && (
            <TestTab
              data={gameData}
              onChange={updateGameData}
              onNext={() => setActiveTab('publish')}
              onBack={() => setActiveTab('rules')}
            />
          )}
          {activeTab === 'publish' && (
            <PublishTab
              data={gameData}
              onChange={updateGameData}
              onBack={() => setActiveTab('test')}
              onPublish={handleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}

