/**
 * Statistics Service Interface
 * 
 * ISP: Small, focused interface for statistics operations only
 */

import { IPlayerStatistics } from '../../entities/PlayerStatistics.entity';
import { IPlayerStatisticsDto, IHeadToHeadStatsDto, IGlobalStatsDto, ILeaderboardDto } from '../../dtos/statistics.dto';

/**
 * Statistics service interface
 * Focused only on statistics retrieval
 */
export interface IStatisticsService {
  /**
   * Get player statistics
   */
  getPlayerStatistics(playerId: string, gameTypeId?: string): Promise<IPlayerStatisticsDto>;

  /**
   * Get head-to-head statistics between two players
   */
  getHeadToHeadStats(player1Id: string, player2Id: string, gameTypeId?: string): Promise<IHeadToHeadStatsDto>;

  /**
   * Get global statistics
   */
  getGlobalStats(gameTypeId?: string): Promise<IGlobalStatsDto>;

  /**
   * Get leaderboard
   */
  getLeaderboard(gameTypeId?: string, options?: { page?: number; limit?: number }): Promise<ILeaderboardDto>;
}

/**
 * Statistics calculation service interface
 * ISP: Separated calculation operations
 */
export interface IStatisticsCalculationService {
  /**
   * Calculate statistics for a player
   */
  calculatePlayerStatistics(playerId: string, gameTypeId: string): Promise<IPlayerStatistics>;

  /**
   * Update statistics after a match
   */
  updateStatisticsAfterMatch(matchId: string): Promise<void>;

  /**
   * Recalculate all statistics for a player
   */
  recalculatePlayerStatistics(playerId: string): Promise<void>;
}

