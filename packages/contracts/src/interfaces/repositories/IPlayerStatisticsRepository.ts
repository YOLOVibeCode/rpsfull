/**
 * Player Statistics Repository Interface
 * 
 * ISP: Small, focused interface for statistics data access only
 */

import { IPlayerStatistics, IPlayerStatisticsUpdate } from '../../entities/PlayerStatistics.entity';

/**
 * Player statistics repository interface
 * Focused only on statistics CRUD operations
 */
export interface IPlayerStatisticsRepository {
  /**
   * Create or update statistics
   */
  upsert(playerId: string, gameTypeId: string, data: IPlayerStatisticsUpdate): Promise<IPlayerStatistics>;

  /**
   * Find statistics by player and game type
   */
  findByPlayerAndGameType(playerId: string, gameTypeId: string): Promise<IPlayerStatistics | null>;

  /**
   * Find all statistics for a player
   */
  findByPlayerId(playerId: string): Promise<IPlayerStatistics[]>;

  /**
   * Update statistics
   */
  update(id: string, data: IPlayerStatisticsUpdate): Promise<IPlayerStatistics>;

  /**
   * Delete statistics
   */
  delete(id: string): Promise<void>;
}

