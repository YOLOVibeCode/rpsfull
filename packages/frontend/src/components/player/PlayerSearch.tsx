'use client';

import { useState } from 'react';
import { usePlayers } from '@/hooks/api/usePlayers';
import { IPlayer } from '@rpsfull-platform/contracts';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { LoadingSpinner } from '@/components/ui/loading-states';

interface PlayerSearchProps {
  onSelect?: (player: IPlayer) => void;
  placeholder?: string;
}

export function PlayerSearch({ onSelect, placeholder = 'Search players...' }: PlayerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: players, isLoading } = usePlayers(debouncedSearch, 10);

  const handleSelect = (player: IPlayer) => {
    if (onSelect) {
      onSelect(player);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchQuery && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Searching...</span>
            </div>
          ) : players && players.length > 0 ? (
            <div className="py-2">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelect(player)}
                  className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center space-x-3"
                >
                  {player.avatarUrl ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={player.avatarUrl}
                      alt={player.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {player.displayName || player.name}
                    </div>
                    <div className="text-xs text-gray-500">{player.name}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No players found</div>
          )}
        </div>
      )}
    </div>
  );
}

