'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IGameTypePublic } from '@rpsfull-platform/contracts';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Play, Eye, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

type SortOption = 'name' | 'newest' | 'oldest' | 'symbols';
type FilterType = 'all' | 'official' | 'community';

export default function GameLibraryPage() {
  const router = useRouter();
  const [games, setGames] = useState<IGameTypePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadGames();
  }, [debouncedSearch]);

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      } else {
        params.append('active', 'true'); // Only show active games by default
      }

      const data = await apiClient.get<IGameTypePublic[]>(`/game-types?${params.toString()}`);
      setGames(data);
    } catch (error: any) {
      toast.error('Failed to load games', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...games];

    // Filter by type (official vs community)
    if (filterType === 'official') {
      filtered = filtered.filter((game) => game.isDefault);
    } else if (filterType === 'community') {
      filtered = filtered.filter((game) => !game.isDefault);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'symbols':
          return b.symbolCount - a.symbolCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [games, sortBy, filterType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Game Library</h1>
        <p className="text-gray-600 mt-2">Discover and play custom game types</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    filterType === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('official')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    filterType === 'official'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Official
                </button>
                <button
                  onClick={() => setFilterType('community')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    filterType === 'community'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Community
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name">Name</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="symbols">Symbols</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Game List */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : filteredAndSortedGames.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">
            {searchQuery ? 'No games found matching your search.' : 'No games available yet.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedGames.length} game{filteredAndSortedGames.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{game.name}</h3>
                    {game.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{game.description}</p>
                    )}
                  </div>
                  {game.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">
                      Official
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {game.symbolCount} symbols
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Symbols Preview */}
                {game.symbols.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {game.symbols.slice(0, 5).map((symbol, idx) => (
                      <span key={idx} className="text-2xl" title={symbol.name}>
                        {symbol.emoji}
                      </span>
                    ))}
                    {game.symbols.length > 5 && (
                      <span className="text-sm text-gray-500">+{game.symbols.length - 5}</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/play?gameType=${game.id}`)}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1 flex-1"
                  >
                    <Play size={16} />
                    Play
                  </Button>
                  <Button
                    onClick={() => router.push(`/games/${game.id}`)}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-1 flex-1"
                  >
                    <Eye size={16} />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

