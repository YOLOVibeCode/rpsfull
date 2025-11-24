/**
 * Player Statistics Entity
 * 
 * Represents aggregated statistics for a player
 */

/**
 * Player statistics entity
 */
export interface IPlayerStatistics {
  readonly id: string;
  readonly playerId: string;
  readonly gameTypeId: string;
  readonly totalMatches: number;
  readonly matchesWon: number;
  readonly matchesLost: number;
  readonly matchesTied: number;
  readonly winRate: number;
  readonly totalRounds: number;
  readonly roundsWon: number;
  readonly roundsLost: number;
  readonly roundsTied: number;
  readonly longestWinStreak: number;
  readonly currentWinStreak: number;
  readonly longestLossStreak: number;
  readonly currentLossStreak: number;
  readonly averageMatchDuration: number;
  readonly favoriteMove?: string;
  readonly leastUsedMove?: string;
  readonly lastPlayedAt?: Date;
  readonly updatedAt: Date;
}

/**
 * Data for creating/updating player statistics
 */
export interface IPlayerStatisticsUpdate {
  totalMatches?: number;
  matchesWon?: number;
  matchesLost?: number;
  matchesTied?: number;
  totalRounds?: number;
  roundsWon?: number;
  roundsLost?: number;
  roundsTied?: number;
  longestWinStreak?: number;
  currentWinStreak?: number;
  longestLossStreak?: number;
  currentLossStreak?: number;
  averageMatchDuration?: number;
  favoriteMove?: string;
  leastUsedMove?: string;
  lastPlayedAt?: Date;
}

